import { IssueCategory, IssuePriority } from '@prisma/client';
export declare class CreateIssueDto {
    title: string;
    description: string;
    category: IssueCategory;
    priority?: IssuePriority;
    building?: string;
    floor?: string;
    roomNumber?: string;
    locationTxt?: string;
    wizardMeta?: Record<string, unknown>;
}
