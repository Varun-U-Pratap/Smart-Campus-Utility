export interface TimeWindow {
    startsAt: Date;
    endsAt: Date;
}
export declare const hasOverlap: (a: TimeWindow, b: TimeWindow) => boolean;
