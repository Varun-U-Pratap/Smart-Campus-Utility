import { IssueStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateIssueStatusDto {
  @IsEnum(IssueStatus)
  status!: IssueStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
