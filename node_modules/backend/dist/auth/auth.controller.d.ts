import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: import("../common/interfaces/request-user.interface").RequestUser;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: import("../common/interfaces/request-user.interface").RequestUser;
    }>;
}
