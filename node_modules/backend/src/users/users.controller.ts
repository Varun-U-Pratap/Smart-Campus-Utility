import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import type { RequestUser } from '../common/interfaces/request-user.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMyProfile(@CurrentUser() user: RequestUser) {
    return this.usersService.findProfile(user.sub);
  }
}
