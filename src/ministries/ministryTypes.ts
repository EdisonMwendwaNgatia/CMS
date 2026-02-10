export interface MinistryMember {
  memberId: string;
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  joinedAt: string;
}

export interface Ministry {
  id?: string;
  name: string;
  description: string;
  leaderName: string;
  leaderEmail: string;
  meetingDay: string;
  meetingTime: string;
  meetingLocation: string;
  memberCount: number;
  members?: MinistryMember[];
  createdAt?: string;
}

export type MinistryInput = Omit<Ministry, 'id' | 'createdAt' | 'memberCount' | 'members'>;