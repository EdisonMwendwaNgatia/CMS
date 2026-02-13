import type { Family } from './familyTypes';

// In-memory family data (replace with backend integration as needed)
let families: Family[] = [];

export const getFamilies = (): Family[] => families;

export const getFamilyById = (id: string): Family | undefined =>
  families.find(f => f.id === id);

export const addFamily = (family: Family) => {
  families.push(family);
};

export const updateFamily = (id: string, updated: Partial<Family>) => {
  families = families.map(f => (f.id === id ? { ...f, ...updated } : f));
};

export const removeFamily = (id: string) => {
  families = families.filter(f => f.id !== id);
};

export const linkMemberToFamily = (
  familyId: string,
  membershipNumber: string,
  relationship: Family['members'][number]['relationship']
) => {
  families = families.map(f =>
    f.id === familyId
      ? {
          ...f,
          members: [
            ...f.members.filter(m => m.membershipNumber !== membershipNumber),
            { membershipNumber, relationship },
          ],
        }
      : f
  );
};

export const unlinkMemberFromFamily = (familyId: string, membershipNumber: string) => {
  families = families.map(f =>
    f.id === familyId
      ? { ...f, members: f.members.filter(m => m.membershipNumber !== membershipNumber) }
      : f
  );
};
