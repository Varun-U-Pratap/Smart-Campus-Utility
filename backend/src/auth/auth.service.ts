import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';

@Injectable()
export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const role = dto.role ?? Role.STUDENT;
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, AuthService.SALT_ROUNDS);

    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          fullName: dto.fullName,
          role,
        },
      });

      if (role === Role.STUDENT) {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentId: dto.studentId ?? `STU-${Date.now()}`,
            department: dto.department ?? 'General',
          },
        });
      }

      if (role === Role.ADMIN) {
        await tx.adminProfile.create({
          data: {
            userId: user.id,
            employeeCode: dto.employeeCode ?? `ADM-${Date.now()}`,
          },
        });
      }

      return user;
    });

    return this.issueSession(createdUser);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.issueSession(user);
  }

  private async issueSession(user: Pick<User, 'id' | 'email' | 'fullName' | 'role'>) {
    const payload: RequestUser = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });

    return {
      accessToken,
      user: payload,
    };
  }
}
