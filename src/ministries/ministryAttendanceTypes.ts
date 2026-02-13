export interface MinistryAttendance {
  id?: string;
  ministryId: string;
  ministryName: string;
  meetingDate: string; // ISO date string
  meetingDay: string;
  attendees: MinistryAttendee[];
  totalMembers: number;
  totalAttended: number;
  attendanceRate: number;
  createdAt?: string;
  createdBy?: string;
}

export interface MinistryAttendee {
  memberId: string;
  membershipNumber: string;
  fullName: string;
  attended: boolean;
  checkInTime?: string; // ISO time string
  notes?: string;
}

export type AttendanceInput = Omit<MinistryAttendance, 'id' | 'createdAt' | 'totalAttended' | 'attendanceRate'>;