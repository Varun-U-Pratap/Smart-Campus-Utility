import { IssueCategory, IssuePriority } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;

  @IsEnum(IssueCategory)
  category!: IssueCategory;

  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsString()
  locationTxt?: string;

  @IsOptional()
  @IsObject()
  wizardMeta?: Record<string, unknown>;
}
