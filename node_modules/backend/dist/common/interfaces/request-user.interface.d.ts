import { Role } from '@prisma/client';
export interface RequestUser {
    sub: string;
    email: string;
    role: Role;
    fullName: string;
}
