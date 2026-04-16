import type { RequestUser } from '../common/interfaces/request-user.interface';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
export declare class BookingController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
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
    create(user: RequestUser, dto: CreateBookingDto): Promise<{
        id: string;
        title: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        roomId: string;
        startsAt: Date;
        endsAt: Date;
    }>;
    updateStatus(bookingId: string, user: RequestUser, dto: UpdateBookingStatusDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        roomId: string;
        startsAt: Date;
        endsAt: Date;
    }>;
}
