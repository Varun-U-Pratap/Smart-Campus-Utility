import { IssueStatus } from '@prisma/client';
export declare class UpdateIssueStatusDto {
    status: IssueStatus;
    note?: string;
}
