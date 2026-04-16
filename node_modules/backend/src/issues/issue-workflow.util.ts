import { IssueStatus } from '@prisma/client';

const allowedTransitions: Record<IssueStatus, IssueStatus[]> = {
  [IssueStatus.OPEN]: [IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED],
  [IssueStatus.IN_PROGRESS]: [IssueStatus.RESOLVED, IssueStatus.OPEN],
  [IssueStatus.RESOLVED]: [IssueStatus.OPEN],
};

export const canTransitionIssue = (
  from: IssueStatus,
  to: IssueStatus,
): boolean => {
  if (from === to) {
    return true;
  }

  return allowedTransitions[from].includes(to);
};
