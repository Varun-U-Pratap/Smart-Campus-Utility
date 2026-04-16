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
exports.IssuesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const issue_workflow_util_1 = require("./issue-workflow.util");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let IssuesService = class IssuesService {
    prisma;
    realtimeGateway;
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async createIssue(reporterId, dto) {
        const ticketNo = this.generateTicketNo();
        const issue = await this.prisma.issue.create({
            data: {
                ticketNo,
                title: dto.title,
                description: dto.description,
                category: dto.category,
                priority: dto.priority,
                building: dto.building,
                floor: dto.floor,
                roomNumber: dto.roomNumber,
                locationTxt: dto.locationTxt,
                wizardMeta: dto.wizardMeta,
                reporterId,
            },
            select: {
                id: true,
                ticketNo: true,
                title: true,
                status: true,
                priority: true,
                category: true,
                createdAt: true,
            },
        });
        this.realtimeGateway.emitIssueUpdated({
            issueId: issue.id,
            status: issue.status,
            ticketNo: issue.ticketNo,
        });
        return issue;
    }
    async listForAdmin(status) {
        return this.prisma.issue.findMany({
            where: status ? { status } : undefined,
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            select: {
                id: true,
                ticketNo: true,
                title: true,
                status: true,
                priority: true,
                category: true,
                openedAt: true,
                resolvedAt: true,
                createdAt: true,
                reporter: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
    async listMine(reporterId) {
        return this.prisma.issue.findMany({
            where: { reporterId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                ticketNo: true,
                title: true,
                status: true,
                priority: true,
                category: true,
                createdAt: true,
                resolvedAt: true,
            },
        });
    }
    async updateStatus(issueId, actorId, role, dto) {
        if (role !== client_1.Role.ADMIN) {
            throw new common_1.BadRequestException('Only admins can change issue status.');
        }
        const current = await this.prisma.issue.findUnique({
            where: { id: issueId },
            select: {
                id: true,
                status: true,
            },
        });
        if (!current) {
            throw new common_1.NotFoundException('Issue not found.');
        }
        if (!(0, issue_workflow_util_1.canTransitionIssue)(current.status, dto.status)) {
            throw new common_1.BadRequestException(`Invalid transition from ${current.status} to ${dto.status}.`);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const issue = await tx.issue.update({
                where: { id: issueId },
                data: {
                    status: dto.status,
                    resolvedAt: dto.status === client_1.IssueStatus.RESOLVED ? new Date() : null,
                },
                select: {
                    id: true,
                    ticketNo: true,
                    status: true,
                    updatedAt: true,
                },
            });
            await tx.issueActivity.create({
                data: {
                    issueId,
                    actorId,
                    fromStatus: current.status,
                    toStatus: dto.status,
                    note: dto.note,
                },
            });
            return issue;
        });
        this.realtimeGateway.emitIssueUpdated({
            issueId: updated.id,
            status: updated.status,
            ticketNo: updated.ticketNo,
            updatedAt: updated.updatedAt,
        });
        return updated;
    }
    generateTicketNo() {
        const ts = Date.now().toString().slice(-7);
        const random = Math.floor(Math.random() * 900 + 100);
        return `SCU-${ts}-${random}`;
    }
};
exports.IssuesService = IssuesService;
exports.IssuesService = IssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], IssuesService);
//# sourceMappingURL=issues.service.js.map