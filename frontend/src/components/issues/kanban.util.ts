import { Issue, IssueStatus } from '../../types/domain';

export const ISSUE_COLUMNS: IssueStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

export const groupIssuesByStatus = (issues: Issue[]) => {
  return ISSUE_COLUMNS.reduce<Record<IssueStatus, Issue[]>>(
    (acc, status) => {
      acc[status] = issues.filter((issue) => issue.status === status);
      return acc;
    },
    {
      OPEN: [],
      IN_PROGRESS: [],
      RESOLVED: [],
    },
  );
};
