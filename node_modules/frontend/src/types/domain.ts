export type Role = 'STUDENT' | 'ADMIN';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface AuthUser {
  sub: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface Issue {
  id: string;
  ticketNo: string;
  title: string;
  status: IssueStatus;
  priority: string;
  category: string;
  openedAt?: string;
  resolvedAt?: string | null;
  createdAt: string;
  reporter?: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  };
  assignee?: {
    id: string;
    fullName: string;
  } | null;
}

export interface AnnouncementTag {
  id: string;
  name: string;
  colorHex?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  visibility: string;
  isSticky: boolean;
  publishedAt?: string | null;
  author: {
    fullName: string;
  };
  tags: Array<{
    tag: AnnouncementTag;
  }>;
}

export interface RoomBooking {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  user?: {
    fullName: string;
  };
}

export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  floor?: string | null;
  capacity: number;
  type?: string;
  bookings?: RoomBooking[];
}
