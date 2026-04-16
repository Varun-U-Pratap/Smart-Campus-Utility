import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Role, RoomType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

const ROOM_BLOCKS = ['AB', 'LHC', 'ESB', 'DES'] as const;
const ROOM_FLOORS = [1, 2, 3, 4, 5, 6, 7] as const;
const ROOMS_PER_FLOOR = 12;
const LAB_DEPARTMENTS = ['CSE', 'ISE', 'AIML'] as const;
const LABS_PER_DEPARTMENT = 4;

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private buildRoomCatalog() {
    const classrooms = ROOM_BLOCKS.flatMap((block) =>
      ROOM_FLOORS.flatMap((floor) =>
        Array.from({ length: ROOMS_PER_FLOOR }, (_, offset) => {
          const roomNo = floor * 100 + offset + 1;
          return {
            code: `${block}${roomNo}`,
            name: `${block} ${roomNo}`,
            building: block,
            floor: `${floor}`,
            capacity: 60,
            type: RoomType.CLASSROOM,
            isActive: true,
          };
        }),
      ),
    );

    const labs = LAB_DEPARTMENTS.flatMap((department) =>
      Array.from({ length: LABS_PER_DEPARTMENT }, (_, index) => {
        const labNo = index + 1;
        return {
          code: `${department}LAB${labNo}`,
          name: `${department} Lab ${labNo}`,
          building: `${department} Labs`,
          floor: '1',
          capacity: 40,
          type: RoomType.LAB,
          isActive: true,
        };
      }),
    );

    return [...classrooms, ...labs];
  }

  private async ensureCampusRooms() {
    const catalog = this.buildRoomCatalog();
    const existingCount = await this.prisma.room.count({
      where: {
        code: {
          in: catalog.map((room) => room.code),
        },
      },
    });

    if (existingCount === catalog.length) {
      return;
    }

    await this.prisma.room.createMany({
      data: catalog,
      skipDuplicates: true,
    });
  }

  async listRooms() {
    await this.ensureCampusRooms();
    return this.prisma.room.findMany({
      where: { isActive: true },
      orderBy: [{ building: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        building: true,
        floor: true,
        capacity: true,
        type: true,
      },
    });
  }

  async availabilityGrid(from?: string, to?: string) {
    await this.ensureCampusRooms();
    const now = new Date();
    const fromDate = from ? new Date(from) : now;
    const toDate = to
      ? new Date(to)
      : new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);

    return this.prisma.room.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        building: true,
        capacity: true,
        bookings: {
          where: {
            startsAt: { lt: toDate },
            endsAt: { gt: fromDate },
            status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          },
          select: {
            id: true,
            title: true,
            startsAt: true,
            endsAt: true,
            status: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { startsAt: 'asc' },
        },
      },
      orderBy: [{ building: 'asc' }, { name: 'asc' }],
    });
  }

  async createBooking(userId: string, dto: CreateBookingDto) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid booking time range.');
    }

    if (startsAt >= endsAt) {
      throw new BadRequestException('Start time must be earlier than end time.');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
      select: {
        id: true,
        capacity: true,
        isActive: true,
      },
    });

    if (!room || !room.isActive) {
      throw new NotFoundException('Room is not available.');
    }

    if (dto.attendeeCount && dto.attendeeCount > room.capacity) {
      throw new BadRequestException('Attendee count exceeds room capacity.');
    }

    await this.assertNoConflict(dto.roomId, startsAt, endsAt);

    const booking = await this.prisma.booking.create({
      data: {
        roomId: dto.roomId,
        userId,
        title: dto.title,
        purpose: dto.purpose,
        attendeeCount: dto.attendeeCount,
        startsAt,
        endsAt,
        status: BookingStatus.PENDING,
      },
      select: {
        id: true,
        roomId: true,
        title: true,
        status: true,
        startsAt: true,
        endsAt: true,
      },
    });

    this.realtimeGateway.emitBookingUpdated({
      bookingId: booking.id,
      roomId: dto.roomId,
      status: booking.status,
    });

    return booking;
  }

  async updateStatus(
    bookingId: string,
    actorId: string,
    role: Role,
    dto: UpdateBookingStatusDto,
  ) {
    if (role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can change booking status.');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        roomId: true,
        startsAt: true,
        endsAt: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (dto.status === BookingStatus.CONFIRMED) {
      await this.assertNoConflict(
        booking.roomId,
        booking.startsAt,
        booking.endsAt,
        booking.id,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: dto.status,
        approvedById:
          dto.status === BookingStatus.CONFIRMED ? actorId : undefined,
      },
      select: {
        id: true,
        roomId: true,
        status: true,
        startsAt: true,
        endsAt: true,
      },
    });

    this.realtimeGateway.emitBookingUpdated(updated as Record<string, unknown>);

    return updated;
  }

  private async assertNoConflict(
    roomId: string,
    startsAt: Date,
    endsAt: Date,
    excludeId?: string,
  ) {
    const conflicting = await this.prisma.booking.findFirst({
      where: {
        roomId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: {
        id: true,
      },
    });

    if (conflicting) {
      throw new ConflictException('Time slot is already booked for this room.');
    }
  }
}
