import { io } from 'socket.io-client';
import { SOCKET_URL } from './env';

export const createRealtimeClient = (token?: string) => {
  return io(SOCKET_URL, {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
  });
};
