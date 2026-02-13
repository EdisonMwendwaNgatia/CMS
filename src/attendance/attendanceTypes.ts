export type AttendanceEntityType = "ministry" | "service" | "event" | "small_group" | "cell_group";

// Generic entity used in the Attendance list (ministries, services, small groups)
export interface AttendanceEntity {
  id: string;
  name: string;
  type: AttendanceEntityType;
  meetingDay?: string;
  meetingTime?: string;
  memberCount: number;
}

export interface Attendee {
  memberId: string;
  membershipNumber?: string;
  fullName: string;
  email?: string;
  phone?: string;
  attended: boolean;
  checkInTime?: string;
  notes?: string;
}

// Unified attendance record shape used by the `Attendance` overview.
// Individual collections (ministryAttendance, serviceAttendance, cellGroupAttendance)
// are mapped into this shape when displayed in the Attendance list.
export interface AttendanceRecord {
  id?: string;
  entityId?: string; // for ministries/cell groups this is the entity id; for services may be undefined
  entityName: string;
  entityType: AttendanceEntityType;
  meetingDate: string; // ISO date
  meetingDay?: string;
  attendees: Attendee[];
  totalMembers?: number; // optional for services where total members are not known
  totalAttended: number;
  attendanceRate?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceSummary {
  date: string;
  totalEvents: number;
  totalMembers: number;
  totalAttended: number;
  overallRate: number;
  breakdown: {
    [key in AttendanceEntityType]?: {
      count: number;
      members: number;
      attended: number;
      rate: number;
    }
  };
}

// Specific input types for each collection (kept for compatibility)
export type ServiceAttendanceInput = {
  serviceDate: string;
  serviceName?: string;
  location?: string;
  attendees: Attendee[];
};

export type CellGroupAttendanceInput = {
  cellGroupId: string;
  cellGroupName: string;
  meetingDate: string;
  leaderName?: string;
  location?: string;
  attendees: Attendee[];
  totalMembers: number;
};

export type MinistryAttendanceInput = {
  ministryId: string;
  ministryName: string;
  meetingDate: string;
  meetingDay?: string;
  attendees: Attendee[];
  totalMembers: number;
};

export type AttendanceInput = ServiceAttendanceInput | CellGroupAttendanceInput | MinistryAttendanceInput;