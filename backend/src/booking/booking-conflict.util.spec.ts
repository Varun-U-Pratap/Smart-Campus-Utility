import { hasOverlap } from './booking-conflict.util';

describe('hasOverlap', () => {
  it('detects overlapping intervals', () => {
    const a = {
      startsAt: new Date('2026-04-16T10:00:00.000Z'),
      endsAt: new Date('2026-04-16T11:00:00.000Z'),
    };
    const b = {
      startsAt: new Date('2026-04-16T10:30:00.000Z'),
      endsAt: new Date('2026-04-16T12:00:00.000Z'),
    };

    expect(hasOverlap(a, b)).toBe(true);
  });

  it('does not overlap when ending at boundary', () => {
    const a = {
      startsAt: new Date('2026-04-16T10:00:00.000Z'),
      endsAt: new Date('2026-04-16T11:00:00.000Z'),
    };
    const b = {
      startsAt: new Date('2026-04-16T11:00:00.000Z'),
      endsAt: new Date('2026-04-16T12:00:00.000Z'),
    };

    expect(hasOverlap(a, b)).toBe(false);
  });
});
