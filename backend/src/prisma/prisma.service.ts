import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      datasourceUrl:
        configService.get<string>('DATABASE_URL') ??
        'postgresql://postgres:postgres@localhost:5432/smart_campus_utility',
      log: ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Prisma database connection established.');
    } catch (error) {
      this.logger.error(
        'Prisma could not connect during startup. Verify DATABASE_URL credentials.',
      );
      this.logger.error(error instanceof Error ? error.message : String(error));
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect().catch(() => {
      this.logger.warn('Prisma disconnect skipped due to inactive connection.');
    });
  }
}
