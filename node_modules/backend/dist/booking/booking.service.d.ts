import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
export declare class BookingService {
    private readonly prisma;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway);
    private buildRoomCatalog;
    private ensureCampusRooms;
    listRooms(): Promise<{
        id: string;
        name: string;
        building: string;
        floor: string | null;
        code: string;
        type: import("@prisma/client").$Enums.RoomType;
        capacity: number;
    }[]>;
    availabilityGrid(from?: string, to?: string): Promise<{
        id: string;
        bookings: {
            user: {
                fullName: string;
            };
            id: string;
            title: string;
            status: import("@prisma/client").$Enums.BookingStatus;
            startsAt: Date;
            endsAt: Date;
        }[];
        name: string;
        building: string;
        code: string;
        capacity: number;
    }[]>;
    createBooking(userId: string, dto: CreateBookingDto): Promise<{
        id: string;
        title: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        roomId: string;
        startsAt: Date;
        endsAt: Date;
    }>;
    updateStatus(bookingId: string, actorId: string, role: Role, dto: UpdateBookingStatusDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        roomId: string;
        startsAt: Date;
        endsAt: Date;
    }>;
    private assertNoConflict;
}
