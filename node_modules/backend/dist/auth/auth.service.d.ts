import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private static readonly SALT_ROUNDS;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: RequestUser;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: RequestUser;
    }>;
    private issueSession;
}
