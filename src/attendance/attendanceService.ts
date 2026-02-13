import {
  collection,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type {
  AttendanceRecord,
  AttendanceEntity,
  AttendanceSummary,
  Attendee,
  AttendanceEntityType,
  ServiceAttendanceInput,
  CellGroupAttendanceInput,
  MinistryAttendanceInput,
} from "./attendanceTypes";

// Helper mappers: map documents from specific collections into the unified AttendanceRecord
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMinistryDocToAttendance(docData: any, id: string): AttendanceRecord {
  const data = docData || {};
  const attendees = (data.attendees || []) as Attendee[];
  const totalAttended = attendees.filter(a => a.attended).length;
  const totalMembers = data.totalMembers || attendees.length;
  const attendanceRate = totalMembers > 0 ? Math.round((totalAttended / totalMembers) * 100) : 0;

  return {
    id,
    entityId: data.ministryId,
    entityName: data.ministryName || "Ministry",
    entityType: "ministry",
    meetingDate: data.meetingDate,
    meetingDay: data.meetingDay,
    attendees,
    totalMembers,
    totalAttended,
    attendanceRate,
    createdAt: data.createdAt,
  } as AttendanceRecord;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapServiceDocToAttendance(docData: any, id: string): AttendanceRecord {
  const data = docData || {};
  const attendees = (data.attendees || []) as Attendee[];
  const totalAttended = attendees.filter(a => a.attended).length;
  const totalMembers = data.totalMembers || attendees.length || 0;
  const attendanceRate = totalMembers > 0 ? Math.round((totalAttended / totalMembers) * 100) : 0;

  return {
    id,
    entityId: id,
    entityName: data.serviceName || "Service",
    entityType: "service",
    meetingDate: data.serviceDate || data.meetingDate,
    attendees,
    totalMembers,
    totalAttended,
    attendanceRate,
    createdAt: data.createdAt,
  } as AttendanceRecord;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCellGroupDocToAttendance(docData: any, id: string): AttendanceRecord {
  const data = docData || {};
  const attendees = (data.attendees || []) as Attendee[];
  const totalAttended = attendees.filter(a => a.attended).length;
  const totalMembers = data.totalMembers || attendees.length || 0;
  const attendanceRate = totalMembers > 0 ? Math.round((totalAttended / totalMembers) * 100) : 0;

  return {
    id,
    entityId: data.cellGroupId,
    entityName: data.cellGroupName || "Cell Group",
    entityType: "cell_group",
    meetingDate: data.meetingDate,
    attendees,
    totalMembers,
    totalAttended,
    attendanceRate,
    createdAt: data.createdAt,
  } as AttendanceRecord;
}

// Create helpers for each collection (kept for convenience)
export async function createServiceAttendance(data: ServiceAttendanceInput) {
  const ref = collection(db, "serviceAttendance");
  const totalAttended = (data.attendees || []).filter(a => a.attended).length;
  const attendanceData = {
    ...data,
    totalAttended,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(ref, attendanceData);
  return { id: docRef.id, ...attendanceData };
}

export async function createCellGroupAttendance(data: CellGroupAttendanceInput) {
  const ref = collection(db, "cellGroupAttendance");
  const totalAttended = (data.attendees || []).filter(a => a.attended).length;
  const attendanceRate = data.totalMembers > 0 ? Math.round((totalAttended / data.totalMembers) * 100) : 0;
  const attendanceData = {
    ...data,
    totalAttended,
    attendanceRate,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(ref, attendanceData);
  return { id: docRef.id, ...attendanceData };
}

export async function createMinistryAttendance(data: MinistryAttendanceInput) {
  const ref = collection(db, "ministryAttendance");
  const totalAttended = (data.attendees || []).filter(a => a.attended).length;
  const attendanceRate = data.totalMembers > 0 ? Math.round((totalAttended / data.totalMembers) * 100) : 0;
  const attendanceData = {
    ...data,
    totalAttended,
    attendanceRate,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(ref, attendanceData);
  return { id: docRef.id, ...attendanceData };
}

// Subscribe to attendance across the three collections and merge results.
export function subscribeToAttendance(
  callback: (records: AttendanceRecord[]) => void,
  filters?: { entityId?: string; entityType?: string; startDate?: string; endDate?: string }
) {
  // maintain maps so each snapshot can update part of the combined list
  const ministriesMap = new Map<string, AttendanceRecord>();
  const servicesMap = new Map<string, AttendanceRecord>();
  const cellGroupsMap = new Map<string, AttendanceRecord>();

  const rebuild = () => {
    const all = [
      ...Array.from(ministriesMap.values()),
      ...Array.from(servicesMap.values()),
      ...Array.from(cellGroupsMap.values()),
    ];
    // sort by meetingDate desc
    all.sort((a, b) => (b.meetingDate || "").localeCompare(a.meetingDate || ""));

    // apply simple filters
    const filtered = all.filter(r => {
      if (filters?.entityType && filters.entityType !== "all") {
        if (r.entityType !== (filters.entityType as AttendanceEntityType)) return false;
      }
      if (filters?.entityId && r.entityId !== filters.entityId) return false;
      if (filters?.startDate && r.meetingDate < filters.startDate) return false;
      if (filters?.endDate && r.meetingDate > filters.endDate) return false;
      return true;
    });

    callback(filtered);
  };

  // ministryAttendance
  const ministryQuery = query(collection(db, "ministryAttendance"), orderBy("meetingDate", "desc"));
  const unsubscribeMin = onSnapshot(ministryQuery, (snapshot) => {
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      ministriesMap.set(docSnap.id, mapMinistryDocToAttendance(data, docSnap.id));
    });
    rebuild();
  });

  // serviceAttendance
  const serviceQuery = query(collection(db, "serviceAttendance"), orderBy("serviceDate", "desc"));
  const unsubscribeSvc = onSnapshot(serviceQuery, (snapshot) => {
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      servicesMap.set(docSnap.id, mapServiceDocToAttendance(data, docSnap.id));
    });
    rebuild();
  });

  // cellGroupAttendance
  const cellQuery = query(collection(db, "cellGroupAttendance"), orderBy("meetingDate", "desc"));
  const unsubscribeCell = onSnapshot(cellQuery, (snapshot) => {
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      cellGroupsMap.set(docSnap.id, mapCellGroupDocToAttendance(data, docSnap.id));
    });
    rebuild();
  });

  return () => {
    unsubscribeMin();
    unsubscribeSvc();
    unsubscribeCell();
  };
}

export async function getAttendanceByEntity(entityId: string) {
  const results: AttendanceRecord[] = [];

  // ministries
  const minQ = query(collection(db, "ministryAttendance"), where("ministryId", "==", entityId), orderBy("meetingDate", "desc"));
  const minSnap = await getDocs(minQ);
  minSnap.docs.forEach(d => results.push(mapMinistryDocToAttendance(d.data(), d.id)));

  // cell groups
  const cellQ = query(collection(db, "cellGroupAttendance"), where("cellGroupId", "==", entityId), orderBy("meetingDate", "desc"));
  const cellSnap = await getDocs(cellQ);
  cellSnap.docs.forEach(d => results.push(mapCellGroupDocToAttendance(d.data(), d.id)));

  // services don't normally have an entityId; none returned here

  // sort
  results.sort((a, b) => (b.meetingDate || "").localeCompare(a.meetingDate || ""));
  return results;
}

export async function fetchAttendanceEntities(): Promise<AttendanceEntity[]> {
  const entities: AttendanceEntity[] = [];

  // Fetch ministries
  const ministriesSnapshot = await getDocs(collection(db, "ministries"));
  ministriesSnapshot.docs.forEach(doc => {
    const data = doc.data();
    entities.push({
      id: doc.id,
      name: data.name,
      type: "ministry",
      meetingDay: data.meetingDay,
      meetingTime: data.meetingTime,
      memberCount: data.memberCount || 0,
    });
  });

  // TODO: add services/small groups registry if created later

  return entities;
}

export function subscribeToAttendanceEntities(callback: (entities: AttendanceEntity[]) => void) {
  const unsubscribeMinistries = onSnapshot(query(collection(db, "ministries")), (snapshot) => {
    const ministries: AttendanceEntity[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: "ministry",
        meetingDay: data.meetingDay,
        meetingTime: data.meetingTime,
        memberCount: data.memberCount || 0,
      };
    });
    callback(ministries);
  });

  return () => unsubscribeMinistries();
}

// Combined attendance summary across the three collections
export async function getAttendanceSummary(startDate?: string, endDate?: string): Promise<AttendanceSummary> {
  const records: AttendanceRecord[] = [];

  // ministries
  let minQ = query(collection(db, "ministryAttendance"));
  if (startDate) minQ = query(minQ, where("meetingDate", ">=", startDate));
  if (endDate) minQ = query(minQ, where("meetingDate", "<=", endDate));
  const minSnap = await getDocs(minQ);
  minSnap.docs.forEach(d => records.push(mapMinistryDocToAttendance(d.data(), d.id)));

  // services (serviceDate)
  let svcQ = query(collection(db, "serviceAttendance"));
  if (startDate) svcQ = query(svcQ, where("serviceDate", ">=", startDate));
  if (endDate) svcQ = query(svcQ, where("serviceDate", "<=", endDate));
  const svcSnap = await getDocs(svcQ);
  svcSnap.docs.forEach(d => records.push(mapServiceDocToAttendance(d.data(), d.id)));

  // cell groups
  let cellQ = query(collection(db, "cellGroupAttendance"));
  if (startDate) cellQ = query(cellQ, where("meetingDate", ">=", startDate));
  if (endDate) cellQ = query(cellQ, where("meetingDate", "<=", endDate));
  const cellSnap = await getDocs(cellQ);
  cellSnap.docs.forEach(d => records.push(mapCellGroupDocToAttendance(d.data(), d.id)));

  const summary: AttendanceSummary = {
    date: new Date().toISOString().split('T')[0],
    totalEvents: records.length,
    totalMembers: 0,
    totalAttended: 0,
    overallRate: 0,
    breakdown: {},
  };

  const breakdown: Partial<Record<AttendanceEntityType, { count: number; members: number; attended: number; rate: number }>> = {};

  records.forEach(record => {
    summary.totalMembers += record.totalMembers || 0;
    summary.totalAttended += record.totalAttended || 0;

    const key = record.entityType as AttendanceEntityType;
    const b = (breakdown[key] ??= { count: 0, members: 0, attended: 0, rate: 0 });
    b.count++;
    b.members += record.totalMembers || 0;
    b.attended += record.totalAttended || 0;
  });

  for (const t of Object.keys(breakdown) as AttendanceEntityType[]) {
    const b = breakdown[t]!;
    b.rate = b.members > 0 ? Math.round((b.attended / b.members) * 100) : 0;
  }

  summary.breakdown = breakdown;
  summary.overallRate = summary.totalMembers > 0 ? Math.round((summary.totalAttended / summary.totalMembers) * 100) : 0;

  return summary;
}

export function subscribeToAttendanceSummary(callback: (summary: AttendanceSummary) => void, startDate?: string, endDate?: string) {
  // For simplicity use polling via snapshots on each collection and recompute
  const recompute = async () => {
    const s = await getAttendanceSummary(startDate, endDate);
    callback(s);
  };

  // subscribe to the three collections and recompute any time there's a change
  const unsub1 = onSnapshot(query(collection(db, "ministryAttendance")), recompute);
  const unsub2 = onSnapshot(query(collection(db, "serviceAttendance")), recompute);
  const unsub3 = onSnapshot(query(collection(db, "cellGroupAttendance")), recompute);

  // initial compute
  recompute();

  return () => {
    unsub1();
    unsub2();
    unsub3();
  };
}

// Delete a record by attempting to delete from all known attendance collections.
export async function deleteAttendanceRecord(id: string) {
  const paths = ["ministryAttendance", "serviceAttendance", "cellGroupAttendance", "attendance"];
  await Promise.all(paths.map(p => deleteDoc(doc(db, p, id)).catch(() => undefined)));
}

// Member attendance stats across collections
export async function getMemberAttendanceStats(memberId: string) {
  let totalSessions = 0;
  let attendedSessions = 0;
  const byEntity: Record<string, { total: number; attended: number; rate: number }> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collectFromSnap = (snapDocs: { data: () => any; id: string }[], mapper: (d: any, id: string) => AttendanceRecord) => {
    snapDocs.forEach(d => {
      const rec = mapper(d.data(), d.id);
      const attendee = rec.attendees?.find(a => a.memberId === memberId);
      if (attendee) {
        totalSessions++;
        if (attendee.attended) attendedSessions++;

        if (!byEntity[rec.entityName]) byEntity[rec.entityName] = { total: 0, attended: 0, rate: 0 };
        byEntity[rec.entityName].total++;
        if (attendee.attended) byEntity[rec.entityName].attended++;
      }
    });
  };

  const minSnap = await getDocs(query(collection(db, "ministryAttendance")));
  collectFromSnap(minSnap.docs, (d, id) => mapMinistryDocToAttendance(d, id));

  const svcSnap = await getDocs(query(collection(db, "serviceAttendance")));
  collectFromSnap(svcSnap.docs, (d, id) => mapServiceDocToAttendance(d, id));

  const cellSnap = await getDocs(query(collection(db, "cellGroupAttendance")));
  collectFromSnap(cellSnap.docs, (d, id) => mapCellGroupDocToAttendance(d, id));

  Object.keys(byEntity).forEach(k => {
    const e = byEntity[k];
    e.rate = Math.round((e.attended / e.total) * 100);
  });

  return {
    totalSessions,
    attendedSessions,
    attendanceRate: totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0,
    byEntity,
  };
}
