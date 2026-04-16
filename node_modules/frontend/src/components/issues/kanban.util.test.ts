import { describe, expect, it } from 'vitest';
import { groupIssuesByStatus } from './kanban.util';

describe('groupIssuesByStatus', () => {
  it('groups issues by workflow status', () => {
    const grouped = groupIssuesByStatus([
      {
        id: '1',
        ticketNo: 'SCU-1',
        title: 'WiFi down',
        status: 'OPEN',
        priority: 'HIGH',
        category: 'NETWORK',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        ticketNo: 'SCU-2',
        title: 'Projector issue',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        category: 'ELECTRICAL',
        createdAt: new Date().toISOString(),
      },
    ]);

    expect(grouped.OPEN).toHaveLength(1);
    expect(grouped.IN_PROGRESS).toHaveLength(1);
    expect(grouped.RESOLVED).toHaveLength(0);
  });
});
