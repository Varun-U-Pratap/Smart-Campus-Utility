import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  purpose?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  attendeeCount?: number;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;
}
