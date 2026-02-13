import {
  collection,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { MinistryAttendance, MinistryAttendee, AttendanceInput } from "./ministryAttendanceTypes";

export async function createAttendanceSession(
  data: AttendanceInput
) {
  const attendanceRef = collection(db, "ministryAttendance");
  
  // Check if attendance already exists for this ministry on this date
  const existingQuery = query(
    attendanceRef,
    where("ministryId", "==", data.ministryId),
    where("meetingDate", "==", data.meetingDate)
  );
  
  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) {
    throw new Error("Attendance already recorded for this meeting date");
  }
  
  const totalAttended = data.attendees.filter(a => a.attended).length;
  const attendanceRate = data.totalMembers > 0 
    ? Math.round((totalAttended / data.totalMembers) * 100) 
    : 0;
  
  const attendanceData = {
    ...data,
    totalAttended,
    attendanceRate,
    createdAt: serverTimestamp(),
  };
  
  await addDoc(attendanceRef, attendanceData);
  return attendanceData;
}

export async function updateAttendanceSession(
  id: string,
  attendees: MinistryAttendee[]
) {
  const attendanceRef = doc(db, "ministryAttendance", id);
  const totalAttended = attendees.filter(a => a.attended).length;
  
  const attendanceDoc = await getDocs(query(
    collection(db, "ministryAttendance"),
    where("__name__", "==", id)
  ));
  
  if (attendanceDoc.empty) return;
  
  const data = attendanceDoc.docs[0].data();
  const totalMembers = data.totalMembers || 0;
  const attendanceRate = totalMembers > 0 
    ? Math.round((totalAttended / totalMembers) * 100) 
    : 0;
  
  await updateDoc(attendanceRef, {
    attendees,
    totalAttended,
    attendanceRate,
  });
}

export function subscribeToMinistryAttendance(
  ministryId: string,
  callback: (attendance: MinistryAttendance[]) => void
) {
  const q = query(
    collection(db, "ministryAttendance"),
    where("ministryId", "==", ministryId),
    orderBy("meetingDate", "desc")
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MinistryAttendance[];
    callback(items);
  });
  
  return unsubscribe;
}

export async function getAttendanceHistory(ministryId: string) {
  const q = query(
    collection(db, "ministryAttendance"),
    where("ministryId", "==", ministryId),
    orderBy("meetingDate", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MinistryAttendance[];
}

export async function deleteAttendanceSession(id: string) {
  const ref = doc(db, "ministryAttendance", id);
  await deleteDoc(ref);
}

export async function getMemberAttendanceStats(
  ministryId: string,
  memberId: string
) {
  const attendanceRef = collection(db, "ministryAttendance");
  const q = query(
    attendanceRef,
    where("ministryId", "==", ministryId)
  );
  
  const snapshot = await getDocs(q);
  let totalSessions = 0;
  let attendedSessions = 0;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    totalSessions++;
    const attendee = data.attendees?.find((a: MinistryAttendee) => a.memberId === memberId);
    if (attendee?.attended) {
      attendedSessions++;
    }
  });
  
  return {
    totalSessions,
    attendedSessions,
    attendanceRate: totalSessions > 0 
      ? Math.round((attendedSessions / totalSessions) * 100) 
      : 0
  };
}