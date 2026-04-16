import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ValidateIf((dto: RegisterDto) => (dto.role ?? Role.STUDENT) === Role.STUDENT)
  @IsString()
  studentId?: string;

  @ValidateIf((dto: RegisterDto) => (dto.role ?? Role.STUDENT) === Role.STUDENT)
  @IsString()
  department?: string;

  @ValidateIf((dto: RegisterDto) => dto.role === Role.ADMIN)
  @IsString()
  employeeCode?: string;
}
