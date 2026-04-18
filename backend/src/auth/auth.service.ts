import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';

@Injectable()
export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly OTP_EXPIRY_MINUTES = 10;
  private static readonly MAX_OTP_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const role = dto.role ?? Role.STUDENT;
    const email = dto.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, isEmailVerified: true },
    });

    if (existingUser && existingUser.isEmailVerified) {
      throw new ConflictException('Email is already registered.');
    }

    // Delete unverified user if exists
    if (existingUser && !existingUser.isEmailVerified) {
      await this.prisma.user.delete({ where: { id: existingUser.id } });
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      AuthService.SALT_ROUNDS,
    );

    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.fullName,
          role,
          isEmailVerified: false,
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

    // Generate and send OTP
    await this.sendVerificationOtp(email, dto.fullName);

    return {
      message: 'Registration successful. Please verify your email.',
      email,
      requiresVerification: true,
    };
  }

  private async sendVerificationOtp(email: string, fullName: string): Promise<void> {
    // Clean up expired OTPs
    await this.prisma.emailVerificationOtp.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + AuthService.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete previous OTP for this email
    await this.prisma.emailVerificationOtp.deleteMany({
      where: { email },
    });

    // Create new OTP
    await this.prisma.emailVerificationOtp.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendOtpEmail(email, code, fullName);
  }

  async verifyEmailOtp(dto: VerifyEmailOtpDto) {
    const email = dto.email.toLowerCase();

    const otp = await this.prisma.emailVerificationOtp.findUnique({
      where: { code: dto.code },
    });

    if (!otp || otp.email !== email) {
      // Increment attempts
      if (otp) {
        await this.prisma.emailVerificationOtp.update({
          where: { id: otp.id },
          data: { attempts: otp.attempts + 1 },
        });
      }
      throw new BadRequestException('Invalid verification code.');
    }

    // Check if OTP is expired
    if (otp.expiresAt < new Date()) {
      await this.prisma.emailVerificationOtp.delete({ where: { id: otp.id } });
      throw new BadRequestException(
        'Verification code expired. Please request a new one.',
      );
    }

    // Check max attempts
    if (otp.attempts >= AuthService.MAX_OTP_ATTEMPTS) {
      await this.prisma.emailVerificationOtp.delete({ where: { id: otp.id } });
      throw new BadRequestException(
        'Too many failed attempts. Please request a new code.',
      );
    }

    // Mark user as verified
    const user = await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    // Delete OTP after successful verification
    await this.prisma.emailVerificationOtp.delete({ where: { id: otp.id } });

    return this.issueSession(user);
  }

  async resendOtp(dto: ResendOtpDto) {
    const email = dto.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    await this.sendVerificationOtp(email, user.fullName);

    return {
      message: 'Verification code sent to your email.',
      email,
    };
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
        isEmailVerified: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email first. Check your inbox for the verification code.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.issueSession(user);
  }

  private async issueSession(
    user: Pick<User, 'id' | 'email' | 'fullName' | 'role'>,
  ) {
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
