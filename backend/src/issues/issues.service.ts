import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IssueStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { canTransitionIssue } from './issue-workflow.util';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class IssuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createIssue(reporterId: string, dto: CreateIssueDto) {
    const ticketNo = this.generateTicketNo();

    const issue = await this.prisma.issue.create({
      data: {
        ticketNo,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority,
        building: dto.building,
        floor: dto.floor,
        roomNumber: dto.roomNumber,
        locationTxt: dto.locationTxt,
        wizardMeta: dto.wizardMeta as Prisma.InputJsonValue | undefined,
        reporterId,
      },
      select: {
        id: true,
        ticketNo: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
      },
    });

    this.realtimeGateway.emitIssueUpdated({
      issueId: issue.id,
      status: issue.status,
      ticketNo: issue.ticketNo,
    });

    return issue;
  }

  async listForAdmin(status?: IssueStatus) {
    return this.prisma.issue.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        ticketNo: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        openedAt: true,
        resolvedAt: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async listMine(reporterId: string) {
    return this.prisma.issue.findMany({
      where: { reporterId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ticketNo: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        resolvedAt: true,
      },
    });
  }

  async updateStatus(
    issueId: string,
    actorId: string,
    role: Role,
    dto: UpdateIssueStatusDto,
  ) {
    if (role !== Role.ADMIN) {
      throw new BadRequestException('Only admins can change issue status.');
    }

    const current = await this.prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!current) {
      throw new NotFoundException('Issue not found.');
    }

    if (!canTransitionIssue(current.status, dto.status)) {
      throw new BadRequestException(
        `Invalid transition from ${current.status} to ${dto.status}.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const issue = await tx.issue.update({
        where: { id: issueId },
        data: {
          status: dto.status,
          resolvedAt: dto.status === IssueStatus.RESOLVED ? new Date() : null,
        },
        select: {
          id: true,
          ticketNo: true,
          status: true,
          updatedAt: true,
        },
      });

      await tx.issueActivity.create({
        data: {
          issueId,
          actorId,
          fromStatus: current.status,
          toStatus: dto.status,
          note: dto.note,
        },
      });

      return issue;
    });

    this.realtimeGateway.emitIssueUpdated({
      issueId: updated.id,
      status: updated.status,
      ticketNo: updated.ticketNo,
      updatedAt: updated.updatedAt,
    });

    return updated;
  }

  private generateTicketNo(): string {
    const ts = Date.now().toString().slice(-7);
    const random = Math.floor(Math.random() * 900 + 100);
    return `SCU-${ts}-${random}`;
  }
}
