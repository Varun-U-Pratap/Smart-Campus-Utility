import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [RealtimeModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
