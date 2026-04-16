import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findProfile(userId: string): Promise<{
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
