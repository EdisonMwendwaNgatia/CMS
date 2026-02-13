// Family data types for linking members by membership number
export type FamilyMemberLink = {
  membershipNumber: string;
  relationship: 'Husband' | 'Wife' | 'Child' | 'Relative' | 'Other';
};

export type Family = {
  id: string;
  familyName: string;
  address?: string; // Added optional address field
  members: FamilyMemberLink[];
};