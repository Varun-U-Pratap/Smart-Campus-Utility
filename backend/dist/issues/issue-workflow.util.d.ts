import { IssueStatus } from '@prisma/client';
export declare const canTransitionIssue: (from: IssueStatus, to: IssueStatus) => boolean;
