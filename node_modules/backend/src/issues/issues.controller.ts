import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { IssueStatus, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { IssuesService } from './issues.service';

@Controller('issues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @Roles(Role.STUDENT)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateIssueDto) {
    return this.issuesService.createIssue(user.sub, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  list(@Query('status') status?: IssueStatus) {
    return this.issuesService.listForAdmin(status);
  }

  @Get('mine')
  @Roles(Role.STUDENT)
  listMine(@CurrentUser() user: RequestUser) {
    return this.issuesService.listMine(user.sub);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') issueId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateIssueStatusDto,
  ) {
    return this.issuesService.updateStatus(issueId, user.sub, user.role, dto);
  }
}
