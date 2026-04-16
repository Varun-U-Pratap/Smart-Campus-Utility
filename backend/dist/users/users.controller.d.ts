import { UsersService } from './users.service';
import type { RequestUser } from '../common/interfaces/request-user.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(user: RequestUser): Promise<{
        studentProfile: {
            studentId: string;
            department: string;
            createdAt: Date;
            updatedAt: Date;
            year: number | null;
            program: string | null;
            section: string | null;
            hostelBlock: string | null;
            userId: string;
        } | null;
        adminProfile: {
            department: string | null;
            employeeCode: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            designation: string | null;
        } | null;
        email: string;
        fullName: string;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
    }>;
}
