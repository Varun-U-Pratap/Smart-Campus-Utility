import { IssueStatus } from '@prisma/client';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { IssuesService } from './issues.service';
export declare class IssuesController {
    private readonly issuesService;
    constructor(issuesService: IssuesService);
    create(user: RequestUser, dto: CreateIssueDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.IssueCategory;
        priority: import("@prisma/client").$Enums.IssuePriority;
        status: import("@prisma/client").$Enums.IssueStatus;
        ticketNo: string;
    }>;
    list(status?: IssueStatus): Promise<{
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
    listMine(user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.IssueCategory;
        priority: import("@prisma/client").$Enums.IssuePriority;
        status: import("@prisma/client").$Enums.IssueStatus;
        ticketNo: string;
        resolvedAt: Date | null;
    }[]>;
    updateStatus(issueId: string, user: RequestUser, dto: UpdateIssueStatusDto): Promise<{
        id: string;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.IssueStatus;
        ticketNo: string;
    }>;
}
