// src/members/generateMembershipNumber.ts
export function generateMembershipNumber(count: number) {
  const year = new Date().getFullYear();
  const padded = String(count + 1).padStart(4, "0");
  return `CH-${year}-${padded}`;
}
