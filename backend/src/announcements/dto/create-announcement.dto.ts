import {
  AnnouncementCategory,
  AnnouncementVisibility,
} from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;

  @IsOptional()
  @IsEnum(AnnouncementCategory)
  category?: AnnouncementCategory;

  @IsOptional()
  @IsEnum(AnnouncementVisibility)
  visibility?: AnnouncementVisibility;

  @IsOptional()
  @IsBoolean()
  isSticky?: boolean;

  @IsOptional()
  @IsBoolean()
  publishNow?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
