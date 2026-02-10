export type VisitorStatus = "pre_member" | "member";

export interface BaptismInfo {
  date?: string;
  place?: string;
  minister?: string;
}

export interface Visitor {
  id?: string;
  fullName: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  maritalStatus?: string;
  occupation?: string;
  profilePhotoUrl?: string;
  status: VisitorStatus;
  createdAt?: string;
  baptism?: BaptismInfo;
}
