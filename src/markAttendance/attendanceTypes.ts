export type AttendanceType = "sunday_service" | "cell_group";

export interface ServiceAttendanceRecord {
  id?: string;
  type: AttendanceType;
  serviceDate: string;
  serviceName?: string; // e.g., "Sunday Morning", "Sunday Evening"
  location?: string;
  attendees: Attendee[];
  totalAttended: number;
  createdAt?: string;
  createdBy?: string;
}

export interface CellGroupAttendanceRecord {
  id?: string;
  type: AttendanceType;
  cellGroupId: string;
  cellGroupName: string;
  meetingDate: string;
  leaderName?: string;
  location?: string;
  attendees: Attendee[];
  totalAttended: number;
  totalMembers: number;
  attendanceRate: number;
  createdAt?: string;
  createdBy?: string;
}

export interface Attendee {
  memberId: string;
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  attended: boolean;
  checkInTime?: string;
  notes?: string;
}

export interface CellGroup {
  id: string;
  name: string;
  leaderName: string;
  leaderEmail: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  memberCount: number;
  members?: Attendee[];
}