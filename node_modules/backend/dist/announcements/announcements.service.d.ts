import { AnnouncementCategory, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class AnnouncementsService {
    private readonly prisma;
    private readonly realtimeGateway;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway);
    create(authorId: string, dto: CreateAnnouncementDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.AnnouncementCategory;
        visibility: import("@prisma/client").$Enums.AnnouncementVisibility;
        isSticky: boolean;
        isPublished: boolean;
        publishedAt: Date | null;
    }>;
    feed(role: Role, category?: AnnouncementCategory, limit?: number): Promise<{
        id: string;
        title: string;
        category: import("@prisma/client").$Enums.AnnouncementCategory;
        body: string;
        visibility: import("@prisma/client").$Enums.AnnouncementVisibility;
        isSticky: boolean;
        tags: {
            tag: {
                id: string;
                name: string;
                colorHex: string | null;
            };
        }[];
        publishedAt: Date | null;
        author: {
            fullName: string;
        };
    }[]>;
    markRead(announcementId: string, userId: string): Promise<{
        userId: string;
        announcementId: string;
        readAt: Date;
    }>;
}
