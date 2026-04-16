import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

@Module({
  imports: [RealtimeModule],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
