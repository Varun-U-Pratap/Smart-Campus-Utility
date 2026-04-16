import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AnnouncementCategory,
  AnnouncementVisibility,
  Role,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(authorId: string, dto: CreateAnnouncementDto) {
    const normalizedTags =
      dto.tags
        ?.map((tag) => tag.trim().toLowerCase())
        .filter((tag) => Boolean(tag)) ?? [];

    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        body: dto.body,
        category: dto.category ?? AnnouncementCategory.GENERAL,
        visibility: dto.visibility ?? AnnouncementVisibility.PUBLIC,
        isSticky: dto.isSticky ?? false,
        isPublished: dto.publishNow ?? true,
        publishedAt: dto.publishNow === false ? null : new Date(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        authorId,
        tags: {
          create: normalizedTags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
        visibility: true,
        isSticky: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    if (announcement.isPublished) {
      this.realtimeGateway.emitAnnouncement(announcement);
    }

    return announcement;
  }

  async feed(role: Role, category?: AnnouncementCategory, limit = 25) {
    return this.prisma.announcement.findMany({
      where: {
        isPublished: true,
        category: category ?? undefined,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        visibility:
          role === Role.ADMIN
            ? {
                in: [
                  AnnouncementVisibility.PUBLIC,
                  AnnouncementVisibility.ADMINS_ONLY,
                ],
              }
            : {
                in: [
                  AnnouncementVisibility.PUBLIC,
                  AnnouncementVisibility.STUDENTS_ONLY,
                ],
              },
      },
      orderBy: [{ isSticky: 'desc' }, { publishedAt: 'desc' }],
      take: Math.min(Math.max(limit, 1), 50),
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        visibility: true,
        isSticky: true,
        publishedAt: true,
        author: {
          select: {
            fullName: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                colorHex: true,
              },
            },
          },
        },
      },
    });
  }

  async markRead(announcementId: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found.');
    }

    return this.prisma.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        announcementId,
        userId,
      },
      select: {
        announcementId: true,
        userId: true,
        readAt: true,
      },
    });
  }
}
