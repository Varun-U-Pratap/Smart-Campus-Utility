import { Server } from 'socket.io';
export declare class RealtimeGateway {
    server: Server;
    emitAnnouncement(payload: Record<string, unknown>): void;
    emitIssueUpdated(payload: Record<string, unknown>): void;
    emitBookingUpdated(payload: Record<string, unknown>): void;
}
