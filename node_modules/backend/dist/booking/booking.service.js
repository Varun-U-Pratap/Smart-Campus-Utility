"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let BookingService = class BookingService {
    prisma;
    realtimeGateway;
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async listRooms() {
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
    async availabilityGrid(from, to) {
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
                        status: { in: [client_1.BookingStatus.PENDING, client_1.BookingStatus.CONFIRMED] },
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
    async createBooking(userId, dto) {
        const startsAt = new Date(dto.startsAt);
        const endsAt = new Date(dto.endsAt);
        if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
            throw new common_1.BadRequestException('Invalid booking time range.');
        }
        if (startsAt >= endsAt) {
            throw new common_1.BadRequestException('Start time must be earlier than end time.');
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
            throw new common_1.NotFoundException('Room is not available.');
        }
        if (dto.attendeeCount && dto.attendeeCount > room.capacity) {
            throw new common_1.BadRequestException('Attendee count exceeds room capacity.');
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
                status: client_1.BookingStatus.PENDING,
            },
            select: {
                id: true,
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
    async updateStatus(bookingId, actorId, role, dto) {
        if (role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can change booking status.');
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
            throw new common_1.NotFoundException('Booking not found.');
        }
        if (dto.status === client_1.BookingStatus.CONFIRMED) {
            await this.assertNoConflict(booking.roomId, booking.startsAt, booking.endsAt, booking.id);
        }
        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: dto.status,
                approvedById: dto.status === client_1.BookingStatus.CONFIRMED ? actorId : undefined,
            },
            select: {
                id: true,
                roomId: true,
                status: true,
                startsAt: true,
                endsAt: true,
            },
        });
        this.realtimeGateway.emitBookingUpdated(updated);
        return updated;
    }
    async assertNoConflict(roomId, startsAt, endsAt, excludeId) {
        const conflicting = await this.prisma.booking.findFirst({
            where: {
                roomId,
                id: excludeId ? { not: excludeId } : undefined,
                status: { in: [client_1.BookingStatus.PENDING, client_1.BookingStatus.CONFIRMED] },
                startsAt: { lt: endsAt },
                endsAt: { gt: startsAt },
            },
            select: {
                id: true,
            },
        });
        if (conflicting) {
            throw new common_1.ConflictException('Time slot is already booked for this room.');
        }
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], BookingService);
//# sourceMappingURL=booking.service.js.map