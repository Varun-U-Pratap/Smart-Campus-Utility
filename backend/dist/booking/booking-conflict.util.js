"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOverlap = void 0;
const hasOverlap = (a, b) => {
    return a.startsAt < b.endsAt && a.endsAt > b.startsAt;
};
exports.hasOverlap = hasOverlap;
//# sourceMappingURL=booking-conflict.util.js.map