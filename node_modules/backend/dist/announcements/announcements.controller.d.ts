import { AnnouncementCategory } from '@prisma/client';
import type { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementsService } from './announcements.service';
export declare class AnnouncementsController {
    private readonly announcementsService;
    constructor(announcementsService: AnnouncementsService);
    feed(user: RequestUser, category?: AnnouncementCategory, limit?: string): Promise<{
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
    create(user: RequestUser, dto: CreateAnnouncementDto): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.AnnouncementCategory;
        visibility: import("@prisma/client").$Enums.AnnouncementVisibility;
        isSticky: boolean;
        isPublished: boolean;
        publishedAt: Date | null;
    }>;
    markRead(user: RequestUser, id: string): Promise<{
        userId: string;
        announcementId: string;
        readAt: Date;
    }>;
}
