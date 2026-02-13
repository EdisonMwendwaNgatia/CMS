import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Member } from "../members/memberTypes";
import type { Family } from "../families/familyTypes";
import type { Ministry } from "../ministries/ministryTypes";
import type { Visitor } from "../visitors/visitorTypes";
import type { AttendanceRecord } from "../attendance/attendanceTypes";

async function fetchCollection<T>(path: string): Promise<T[]> {
  const ref = collection(db, path);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as T) }));
}

export async function fetchAllMembers(): Promise<Member[]> {
  return fetchCollection<Member>("members");
}

export async function fetchAllFamilies(): Promise<Family[]> {
  return fetchCollection<Family>("families");
}

export async function fetchAllMinistries(): Promise<Ministry[]> {
  return fetchCollection<Ministry>("ministries");
}

export async function fetchAllVisitors(): Promise<Visitor[]> {
  return fetchCollection<Visitor>("visitors");
}

export async function fetchAllCellGroupAttendance(): Promise<AttendanceRecord[]> {
  return fetchCollection<AttendanceRecord>("cellGroupAttendance");
}

export async function fetchAllMinistryAttendance(): Promise<AttendanceRecord[]> {
  return fetchCollection<AttendanceRecord>("ministryAttendance");
}
