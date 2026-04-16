-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."IssuePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."IssueCategory" AS ENUM ('ELECTRICAL', 'PLUMBING', 'NETWORK', 'CLEANLINESS', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AnnouncementCategory" AS ENUM ('GENERAL', 'ACADEMIC', 'EVENT', 'EMERGENCY', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."AnnouncementVisibility" AS ENUM ('PUBLIC', 'STUDENTS_ONLY', 'ADMINS_ONLY');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."RoomType" AS ENUM ('CLASSROOM', 'LAB', 'AUDITORIUM', 'MEETING_ROOM', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ANNOUNCEMENT', 'ISSUE_UPDATE', 'BOOKING_UPDATE', 'SYSTEM');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phoneNumber" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentProfile" (
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "program" TEXT,
    "year" INTEGER,
    "section" TEXT,
    "hostelBlock" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."AdminProfile" (
    "userId" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "department" TEXT,
    "designation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Issue" (
    "id" TEXT NOT NULL,
    "ticketNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."IssueCategory" NOT NULL,
    "priority" "public"."IssuePriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."IssueStatus" NOT NULL DEFAULT 'OPEN',
    "building" TEXT,
    "floor" TEXT,
    "roomNumber" TEXT,
    "locationTxt" TEXT,
    "wizardMeta" JSONB,
    "reporterId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IssueComment" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IssueActivity" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "public"."IssueStatus",
    "toStatus" "public"."IssueStatus",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IssueAttachment" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileMimeType" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "public"."AnnouncementCategory" NOT NULL DEFAULT 'GENERAL',
    "visibility" "public"."AnnouncementVisibility" NOT NULL DEFAULT 'PUBLIC',
    "isSticky" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnnouncementTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHex" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnnouncementOnTag" (
    "announcementId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "AnnouncementOnTag_pkey" PRIMARY KEY ("announcementId","tagId")
);

-- CreateTable
CREATE TABLE "public"."AnnouncementRead" (
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("announcementId","userId")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."RoomType" NOT NULL DEFAULT 'CLASSROOM',
    "building" TEXT NOT NULL,
    "floor" TEXT,
    "capacity" INTEGER NOT NULL,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoomAvailabilitySlot" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomAvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT,
    "attendeeCount" INTEGER,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "public"."User"("role", "isActive");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "public"."StudentProfile"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_employeeCode_key" ON "public"."AdminProfile"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "public"."RefreshToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_revokedAt_idx" ON "public"."RefreshToken"("revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_ticketNo_key" ON "public"."Issue"("ticketNo");

-- CreateIndex
CREATE INDEX "Issue_status_priority_createdAt_idx" ON "public"."Issue"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "Issue_reporterId_createdAt_idx" ON "public"."Issue"("reporterId", "createdAt");

-- CreateIndex
CREATE INDEX "Issue_assigneeId_status_idx" ON "public"."Issue"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "Issue_category_status_idx" ON "public"."Issue"("category", "status");

-- CreateIndex
CREATE INDEX "IssueComment_issueId_createdAt_idx" ON "public"."IssueComment"("issueId", "createdAt");

-- CreateIndex
CREATE INDEX "IssueComment_authorId_createdAt_idx" ON "public"."IssueComment"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "IssueActivity_issueId_createdAt_idx" ON "public"."IssueActivity"("issueId", "createdAt");

-- CreateIndex
CREATE INDEX "IssueActivity_actorId_createdAt_idx" ON "public"."IssueActivity"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "IssueAttachment_issueId_createdAt_idx" ON "public"."IssueAttachment"("issueId", "createdAt");

-- CreateIndex
CREATE INDEX "Announcement_isPublished_isSticky_publishedAt_idx" ON "public"."Announcement"("isPublished", "isSticky", "publishedAt");

-- CreateIndex
CREATE INDEX "Announcement_category_visibility_idx" ON "public"."Announcement"("category", "visibility");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementTag_name_key" ON "public"."AnnouncementTag"("name");

-- CreateIndex
CREATE INDEX "AnnouncementOnTag_tagId_idx" ON "public"."AnnouncementOnTag"("tagId");

-- CreateIndex
CREATE INDEX "AnnouncementRead_userId_readAt_idx" ON "public"."AnnouncementRead"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "public"."Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Room_code_key" ON "public"."Room"("code");

-- CreateIndex
CREATE INDEX "Room_building_isActive_idx" ON "public"."Room"("building", "isActive");

-- CreateIndex
CREATE INDEX "RoomAvailabilitySlot_roomId_dayOfWeek_startTime_idx" ON "public"."RoomAvailabilitySlot"("roomId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "Booking_roomId_startsAt_endsAt_idx" ON "public"."Booking"("roomId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Booking_userId_startsAt_idx" ON "public"."Booking"("userId", "startsAt");

-- CreateIndex
CREATE INDEX "Booking_status_startsAt_idx" ON "public"."Booking"("status", "startsAt");

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Issue" ADD CONSTRAINT "Issue_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Issue" ADD CONSTRAINT "Issue_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssueComment" ADD CONSTRAINT "IssueComment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "public"."Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssueComment" ADD CONSTRAINT "IssueComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssueActivity" ADD CONSTRAINT "IssueActivity_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "public"."Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssueActivity" ADD CONSTRAINT "IssueActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssueAttachment" ADD CONSTRAINT "IssueAttachment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "public"."Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssueAttachment" ADD CONSTRAINT "IssueAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnouncementOnTag" ADD CONSTRAINT "AnnouncementOnTag_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "public"."Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnouncementOnTag" ADD CONSTRAINT "AnnouncementOnTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."AnnouncementTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "public"."Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomAvailabilitySlot" ADD CONSTRAINT "RoomAvailabilitySlot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
