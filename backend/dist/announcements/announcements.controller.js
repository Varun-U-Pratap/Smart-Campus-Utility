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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const create_announcement_dto_1 = require("./dto/create-announcement.dto");
const announcements_service_1 = require("./announcements.service");
let AnnouncementsController = class AnnouncementsController {
    announcementsService;
    constructor(announcementsService) {
        this.announcementsService = announcementsService;
    }
    feed(user, category, limit = '25') {
        return this.announcementsService.feed(user.role, category, Number(limit));
    }
    create(user, dto) {
        return this.announcementsService.create(user.sub, dto);
    }
    markRead(user, id) {
        return this.announcementsService.markRead(id, user.sub);
    }
};
exports.AnnouncementsController = AnnouncementsController;
__decorate([
    (0, common_1.Get)('feed'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT, client_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "feed", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_announcement_dto_1.CreateAnnouncementDto]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT, client_1.Role.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AnnouncementsController.prototype, "markRead", null);
exports.AnnouncementsController = AnnouncementsController = __decorate([
    (0, common_1.Controller)('announcements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [announcements_service_1.AnnouncementsService])
], AnnouncementsController);
//# sourceMappingURL=announcements.controller.js.map