export interface TimeWindow {
  startsAt: Date;
  endsAt: Date;
}

export const hasOverlap = (a: TimeWindow, b: TimeWindow): boolean => {
  return a.startsAt < b.endsAt && a.endsAt > b.startsAt;
};
