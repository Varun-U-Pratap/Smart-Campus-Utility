import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('rooms')
  @Roles(Role.STUDENT, Role.ADMIN)
  listRooms() {
    return this.bookingService.listRooms();
  }

  @Get('grid')
  @Roles(Role.STUDENT, Role.ADMIN)
  availabilityGrid(@Query('from') from?: string, @Query('to') to?: string) {
    return this.bookingService.availabilityGrid(from, to);
  }

  @Post()
  @Roles(Role.STUDENT, Role.ADMIN)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(user.sub, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') bookingId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateStatus(
      bookingId,
      user.sub,
      user.role,
      dto,
    );
  }
}
