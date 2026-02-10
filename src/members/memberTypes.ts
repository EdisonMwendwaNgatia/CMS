import type { Timestamp, FieldValue } from "firebase/firestore";

export type MemberStatus =
  | "visitor"
  | "new member"
  | "full member"
  | "inactive"
  | "suspended";

export interface BaptismInfo {
  date?: string;
  place?: string;
  minister?: string;
}

export interface Member {
  id?: string;
  membershipNumber: string;
  fullName: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  maritalStatus: string;
  occupation: string;
  profilePhotoUrl?: string;
  status: MemberStatus;
  baptism?: BaptismInfo;
  createdAt: Timestamp | FieldValue;
}
