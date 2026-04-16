import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementCategory, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get('feed')
  @Roles(Role.STUDENT, Role.ADMIN)
  feed(
    @CurrentUser() user: RequestUser,
    @Query('category') category?: AnnouncementCategory,
    @Query('limit') limit = '25',
  ) {
    return this.announcementsService.feed(user.role, category, Number(limit));
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(user.sub, dto);
  }

  @Post(':id/read')
  @Roles(Role.STUDENT, Role.ADMIN)
  markRead(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.announcementsService.markRead(id, user.sub);
  }
}
