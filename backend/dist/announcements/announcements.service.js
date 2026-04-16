"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let AnnouncementsService = class AnnouncementsService {
    prisma;
    realtimeGateway;
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async create(authorId, dto) {
        const normalizedTags = dto.tags
            ?.map((tag) => tag.trim().toLowerCase())
            .filter((tag) => Boolean(tag)) ?? [];
        const announcement = await this.prisma.announcement.create({
            data: {
                title: dto.title,
                body: dto.body,
                category: dto.category ?? client_1.AnnouncementCategory.GENERAL,
                visibility: dto.visibility ?? client_1.AnnouncementVisibility.PUBLIC,
                isSticky: dto.isSticky ?? false,
                isPublished: dto.publishNow ?? true,
                publishedAt: dto.publishNow === false ? null : new Date(),
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                authorId,
                tags: {
                    create: normalizedTags.map((name) => ({
                        tag: {
                            connectOrCreate: {
                                where: { name },
                                create: { name },
                            },
                        },
                    })),
                },
            },
            select: {
                id: true,
                title: true,
                category: true,
                visibility: true,
                isSticky: true,
                isPublished: true,
                publishedAt: true,
                createdAt: true,
            },
        });
        if (announcement.isPublished) {
            this.realtimeGateway.emitAnnouncement(announcement);
        }
        return announcement;
    }
    async feed(role, category, limit = 25) {
        return this.prisma.announcement.findMany({
            where: {
                isPublished: true,
                category: category ?? undefined,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                visibility: role === client_1.Role.ADMIN
                    ? {
                        in: [
                            client_1.AnnouncementVisibility.PUBLIC,
                            client_1.AnnouncementVisibility.ADMINS_ONLY,
                        ],
                    }
                    : {
                        in: [
                            client_1.AnnouncementVisibility.PUBLIC,
                            client_1.AnnouncementVisibility.STUDENTS_ONLY,
                        ],
                    },
            },
            orderBy: [{ isSticky: 'desc' }, { publishedAt: 'desc' }],
            take: Math.min(Math.max(limit, 1), 50),
            select: {
                id: true,
                title: true,
                body: true,
                category: true,
                visibility: true,
                isSticky: true,
                publishedAt: true,
                author: {
                    select: {
                        fullName: true,
                    },
                },
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                colorHex: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async markRead(announcementId, userId) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id: announcementId },
            select: { id: true },
        });
        if (!announcement) {
            throw new common_1.NotFoundException('Announcement not found.');
        }
        return this.prisma.announcementRead.upsert({
            where: {
                announcementId_userId: {
                    announcementId,
                    userId,
                },
            },
            update: {
                readAt: new Date(),
            },
            create: {
                announcementId,
                userId,
            },
            select: {
                announcementId: true,
                userId: true,
                readAt: true,
            },
        });
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map