import { IssueStatus } from '@prisma/client';
import { canTransitionIssue } from './issue-workflow.util';

describe('canTransitionIssue', () => {
  it('allows OPEN to IN_PROGRESS', () => {
    expect(canTransitionIssue(IssueStatus.OPEN, IssueStatus.IN_PROGRESS)).toBe(
      true,
    );
  });

  it('allows IN_PROGRESS to RESOLVED', () => {
    expect(
      canTransitionIssue(IssueStatus.IN_PROGRESS, IssueStatus.RESOLVED),
    ).toBe(true);
  });

  it('blocks RESOLVED to IN_PROGRESS', () => {
    expect(
      canTransitionIssue(IssueStatus.RESOLVED, IssueStatus.IN_PROGRESS),
    ).toBe(false);
  });
});
