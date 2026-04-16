import { IssueStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class IssuesService {
    private readonly prisma;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway);
    createIssue(reporterId: string, dto: CreateIssueDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.IssueCategory;
        priority: import("@prisma/client").$Enums.IssuePriority;
        status: import("@prisma/client").$Enums.IssueStatus;
        ticketNo: string;
    }>;
    listForAdmin(status?: IssueStatus): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.IssueCategory;
        priority: import("@prisma/client").$Enums.IssuePriority;
        status: import("@prisma/client").$Enums.IssueStatus;
        ticketNo: string;
        reporter: {
            email: string;
            fullName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        };
        assignee: {
            fullName: string;
            id: string;
        } | null;
    }[]>;
    listMine(reporterId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.IssueCategory;
        priority: import("@prisma/client").$Enums.IssuePriority;
        status: import("@prisma/client").$Enums.IssueStatus;
        ticketNo: string;
        resolvedAt: Date | null;
    }[]>;
    updateStatus(issueId: string, actorId: string, role: Role, dto: UpdateIssueStatusDto): Promise<{
        id: string;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.IssueStatus;
        ticketNo: string;
    }>;
    private generateTicketNo;
}
