import { AnnouncementCategory, AnnouncementVisibility } from '@prisma/client';
export declare class CreateAnnouncementDto {
    title: string;
    body: string;
    category?: AnnouncementCategory;
    visibility?: AnnouncementVisibility;
    isSticky?: boolean;
    publishNow?: boolean;
    expiresAt?: string;
    tags?: string[];
}
