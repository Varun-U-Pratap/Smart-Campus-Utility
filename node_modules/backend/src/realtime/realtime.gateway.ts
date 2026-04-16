import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'events',
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  emitAnnouncement(payload: Record<string, unknown>): void {
    this.server.emit('announcement.published', payload);
  }

  emitIssueUpdated(payload: Record<string, unknown>): void {
    this.server.emit('issue.updated', payload);
  }

  emitBookingUpdated(payload: Record<string, unknown>): void {
    this.server.emit('booking.updated', payload);
  }
}
