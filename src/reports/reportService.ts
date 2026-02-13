/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Member } from '../members/memberTypes';
import type { Visitor } from '../visitors/visitorTypes';
import type { Family } from '../families/familyTypes';
import type { Ministry } from '../ministries/ministryTypes';
import type { AttendanceRecord, Attendee } from '../attendance/attendanceTypes';
import type { ReportData, ReportFilters, ReportSummary, ReportType, ReportRow } from './reportTypes';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ============ DATA FETCHING ============

export const fetchReportData = async (
  type: ReportType,
  filters: ReportFilters
): Promise<ReportData> => {
  let data: ReportRow[] = [];
  let summary: ReportSummary = { totalRecords: 0 };

  switch (type) {
    case 'members':
      data = await fetchMembersData(filters);
      summary = generateMembersSummary(data as Member[]);
      break;
    case 'visitors':
      data = await fetchVisitorsData(filters);
      summary = generateVisitorsSummary(data as Visitor[]);
      break;
    case 'families':
      data = await fetchFamiliesData(filters);
      summary = generateFamiliesSummary(data as Family[]);
      break;
    case 'attendance':
      data = await fetchAttendanceData(filters);
      summary = generateAttendanceSummary(data as AttendanceRecord[]);
      break;
    case 'ministries':
      data = await fetchMinistriesData(filters);
      summary = generateMinistriesSummary(data as Ministry[]);
      break;
  }

  return {
    type,
    generatedAt: new Date().toISOString(),
    filters,
    summary,
    data,
  };
};

const fetchMembersData = async (filters: ReportFilters): Promise<Member[]> => {
  let q = query(collection(db, 'members'), orderBy('fullName'));
  
  if (filters.status && filters.status !== 'all') {
    q = query(q, where('status', '==', filters.status));
  }
  
  if (filters.startDate && filters.endDate) {
    q = query(q, 
      where('createdAt', '>=', Timestamp.fromDate(new Date(filters.startDate))),
      where('createdAt', '<=', Timestamp.fromDate(new Date(filters.endDate)))
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
};

const fetchVisitorsData = async (filters: ReportFilters): Promise<Visitor[]> => {
  let q = query(collection(db, 'visitors'), orderBy('fullName'));
  
  if (filters.startDate && filters.endDate) {
    q = query(q, 
      where('createdAt', '>=', Timestamp.fromDate(new Date(filters.startDate))),
      where('createdAt', '<=', Timestamp.fromDate(new Date(filters.endDate)))
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visitor));
};

const fetchFamiliesData = async (filters: ReportFilters): Promise<Family[]> => {
  let q = query(collection(db, 'families'), orderBy('familyName'));

  if (filters?.startDate && filters?.endDate) {
    q = query(
      q,
      where('createdAt', '>=', Timestamp.fromDate(new Date(filters.startDate))),
      where('createdAt', '<=', Timestamp.fromDate(new Date(filters.endDate)))
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Family));
};

const fetchAttendanceData = async (filters: ReportFilters): Promise<AttendanceRecord[]> => {
  const records: AttendanceRecord[] = [];
  
  // Fetch from ministryAttendance
  let ministryQuery = query(collection(db, 'ministryAttendance'), orderBy('meetingDate', 'desc'));
  if (filters.startDate) {
    ministryQuery = query(ministryQuery, where('meetingDate', '>=', filters.startDate));
  }
  if (filters.endDate) {
    ministryQuery = query(ministryQuery, where('meetingDate', '<=', filters.endDate));
  }
  if (filters.entityType === 'ministry' || !filters.entityType) {
    const ministrySnapshot = await getDocs(ministryQuery);
    ministrySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const attendees = (data.attendees || []) as Attendee[];
      records.push({
        id: doc.id,
        entityId: data.ministryId,
        entityName: data.ministryName || 'Ministry',
        entityType: 'ministry',
        meetingDate: data.meetingDate,
        meetingDay: data.meetingDay,
        attendees,
  totalMembers: data.totalMembers || attendees.length || 0,
  totalAttended: data.totalAttended ?? attendees.filter((a: Attendee) => a.attended).length ?? 0,
        attendanceRate: data.attendanceRate || 0,
        createdAt: data.createdAt,
      });
    });
  }

  // Fetch from serviceAttendance
  let serviceQuery = query(collection(db, 'serviceAttendance'), orderBy('serviceDate', 'desc'));
  if (filters.startDate) {
    serviceQuery = query(serviceQuery, where('serviceDate', '>=', filters.startDate));
  }
  if (filters.endDate) {
    serviceQuery = query(serviceQuery, where('serviceDate', '<=', filters.endDate));
  }
  if (filters.entityType === 'service' || !filters.entityType) {
    const serviceSnapshot = await getDocs(serviceQuery);
    serviceSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const attendees = (data.attendees || []) as Attendee[];
      const totalAttended = attendees.filter((a: Attendee) => a.attended).length;
      records.push({
        id: doc.id,
        entityId: doc.id,
        entityName: data.serviceName || 'Service',
        entityType: 'service',
        meetingDate: data.serviceDate,
        attendees,
        totalMembers: attendees.length,
        totalAttended,
        attendanceRate: attendees.length > 0 ? Math.round((totalAttended / attendees.length) * 100) : 0,
        createdAt: data.createdAt,
      });
    });
  }

  // Fetch from cellGroupAttendance
  let cellQuery = query(collection(db, 'cellGroupAttendance'), orderBy('meetingDate', 'desc'));
  if (filters.startDate) {
    cellQuery = query(cellQuery, where('meetingDate', '>=', filters.startDate));
  }
  if (filters.endDate) {
    cellQuery = query(cellQuery, where('meetingDate', '<=', filters.endDate));
  }
  if (filters.entityType === 'cell_group' || !filters.entityType) {
    const cellSnapshot = await getDocs(cellQuery);
    cellSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const attendees = (data.attendees || []) as Attendee[];
      records.push({
        id: doc.id,
        entityId: data.cellGroupId,
        entityName: data.cellGroupName || 'Cell Group',
        entityType: 'cell_group',
        meetingDate: data.meetingDate,
        attendees,
        totalMembers: data.totalMembers || attendees.length || 0,
        totalAttended: data.totalAttended ?? attendees.filter((a: Attendee) => a.attended).length ?? 0,
        attendanceRate: data.attendanceRate || 0,
        createdAt: data.createdAt,
      });
    });
  }

  // Sort by meeting date descending
  return records.sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));
};

const fetchMinistriesData = async (filters?: ReportFilters): Promise<Ministry[]> => {
  let q = query(collection(db, 'ministries'), orderBy('name'));

  if (filters?.startDate && filters?.endDate) {
    q = query(
      q,
      where('createdAt', '>=', Timestamp.fromDate(new Date(filters.startDate))),
      where('createdAt', '<=', Timestamp.fromDate(new Date(filters.endDate)))
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ministry));
};

// ============ SUMMARY GENERATORS ============

const generateMembersSummary = (members: Member[]): ReportSummary => {
  const totalRecords = members.length;
  const activeRecords = members.filter(m => m.status === 'full_member').length;
  const newRecords = members.filter(m => m.status === 'new_member').length;
  
  const genderBreakdown = {
    male: members.filter(m => m.gender === 'Male').length,
    female: members.filter(m => m.gender === 'Female').length,
    other: members.filter(m => m.gender === 'Other').length,
  };
  
  const statusBreakdown: Record<string, number> = {};
  members.forEach(m => {
    statusBreakdown[m.status] = (statusBreakdown[m.status] || 0) + 1;
  });
  
  const ages = members
    .map(m => m.dob ? calculateAge(m.dob) : null)
    .filter(age => age !== null) as number[];
  
  const averageAge = ages.length 
    ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) 
    : undefined;
  
  return {
    totalRecords,
    activeRecords,
    newRecords,
    averageAge,
    genderBreakdown,
    statusBreakdown,
  };
};

const generateVisitorsSummary = (visitors: Visitor[]): ReportSummary => {
  const totalRecords = visitors.length;
  
  const genderBreakdown = {
    male: visitors.filter(v => v.gender === 'Male').length,
    female: visitors.filter(v => v.gender === 'Female').length,
    other: visitors.filter(v => v.gender === 'Other').length,
  };
  
  const baptized = visitors.filter(v => v.baptism?.date).length;
  
  const statusBreakdown = {
    baptized,
    pending: totalRecords - baptized,
  };
  
  return {
    totalRecords,
    genderBreakdown,
    statusBreakdown,
  };
};

const generateFamiliesSummary = (families: Family[]): ReportSummary => {
  const totalRecords = families.length;
  const totalMembers = families.reduce((sum, f) => sum + (f.members?.length || 0), 0);
  
  const familiesWithAddress = families.filter(f => f.address).length;
  
  return {
    totalRecords,
    activeRecords: familiesWithAddress,
    averageAge: Math.round(totalMembers / totalRecords),
  };
};

const generateAttendanceSummary = (attendance: AttendanceRecord[]): ReportSummary => {
  const totalRecords = attendance.length;
  const totalAttended = attendance.reduce((sum, a) => sum + (a.totalAttended || 0), 0);
  const totalMembers = attendance.reduce((sum, a) => sum + (a.totalMembers || 0), 0);
  
  const attendanceRate = totalMembers > 0 
    ? Math.round((totalAttended / totalMembers) * 100) 
    : 0;
  
  // Breakdown by entity type
  const entityBreakdown: Record<string, { count: number; members: number; attended: number; rate: number }> = {};
  
  attendance.forEach(a => {
    const type = a.entityType;
    if (!entityBreakdown[type]) {
      entityBreakdown[type] = { count: 0, members: 0, attended: 0, rate: 0 };
    }
    entityBreakdown[type].count++;
    entityBreakdown[type].members += a.totalMembers || 0;
    entityBreakdown[type].attended += a.totalAttended || 0;
  });
  
  // Calculate rates for each type
  Object.keys(entityBreakdown).forEach(type => {
    const b = entityBreakdown[type];
    b.rate = b.members > 0 ? Math.round((b.attended / b.members) * 100) : 0;
  });
  
  return {
    totalRecords,
    attendanceRate,
    statusBreakdown: entityBreakdown,
    entityBreakdown,
  };
};

const generateMinistriesSummary = (ministries: Ministry[]): ReportSummary => {
  const totalRecords = ministries.length;
  const totalMembers = ministries.reduce((sum, m) => sum + (m.memberCount || 0), 0);
  
  const meetingDays: Record<string, number> = {};
  ministries.forEach(m => {
    meetingDays[m.meetingDay] = (meetingDays[m.meetingDay] || 0) + 1;
  });
  
  return {
    totalRecords,
    averageAge: totalRecords > 0 ? Math.round(totalMembers / totalRecords) : 0,
    statusBreakdown: meetingDays,
  };
};

// ============ EXPORT FUNCTIONS ============

export const exportToExcel = (reportData: ReportData, filename: string) => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Format data for Excel
  const worksheetData = reportData.data.map((item, index) => {
    const row: Record<string, string | number> = { '#': index + 1 };

    switch (reportData.type) {
      case 'members': {
        const m = item as Member;
        return {
          ...row,
          'Membership No.': m.membershipNumber || 'N/A',
          'Full Name': m.fullName,
          'Gender': m.gender,
          'Email': m.email,
          'Phone': m.phone,
          'Status': m.status,
          'Marital Status': m.maritalStatus || 'N/A',
          'Occupation': m.occupation || 'N/A',
        };
      }
      case 'visitors': {
        const v = item as Visitor;
        return {
          ...row,
          'Full Name': v.fullName,
          'Gender': v.gender,
          'Email': v.email,
          'Phone': v.phone,
          'Status': v.status,
          'Baptized': v.baptism?.date ? 'Yes' : 'No',
        };
      }
      case 'families': {
        const f = item as Family;
        return {
          ...row,
          'Family Name': f.familyName,
          'Address': f.address || 'N/A',
          'Members Count': f.members?.length || 0,
        };
      }
      case 'attendance': {
        const a = item as AttendanceRecord;
        return {
          ...row,
          'Date': new Date(a.meetingDate).toLocaleDateString(),
          'Entity': a.entityName,
          'Type': a.entityType,
          'Present': a.totalAttended || 0,
          'Total': a.totalMembers || 0,
          'Rate': a.attendanceRate ? `${a.attendanceRate}%` : '0%',
        };
      }
      case 'ministries': {
        const m = item as Ministry;
        return {
          ...row,
          'Ministry Name': m.name,
          'Leader': m.leaderName,
          'Meeting': `${m.meetingDay || ''} ${m.meetingTime || ''}`.trim() || 'Not scheduled',
          'Location': m.meetingLocation || 'N/A',
          'Members': m.memberCount || 0,
        };
      }
      default:
        return item as unknown as Record<string, string | number>;
    }
  });
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(worksheetData);
  
  // Add summary sheet
  const summaryData = [
    ['Report Summary'],
    ['Generated At', new Date(reportData.generatedAt).toLocaleString()],
    ['Report Type', reportData.type],
    ['Date Range', `${reportData.filters.startDate || 'N/A'} to ${reportData.filters.endDate || 'N/A'}`],
    ['Total Records', reportData.summary.totalRecords],
  ];
  
  // Add additional summary fields
  if (reportData.summary.activeRecords !== undefined) {
    summaryData.push(['Active Records', reportData.summary.activeRecords]);
  }
  if (reportData.summary.newRecords !== undefined) {
    summaryData.push(['New Records', reportData.summary.newRecords]);
  }
  if (reportData.summary.attendanceRate !== undefined) {
    summaryData.push(['Attendance Rate', `${reportData.summary.attendanceRate}%`]);
  }
  if (reportData.summary.averageAge !== undefined) {
    summaryData.push(['Average Age', reportData.summary.averageAge]);
  }
  
  // Add gender breakdown
  if (reportData.summary.genderBreakdown) {
    summaryData.push(['Male', reportData.summary.genderBreakdown.male]);
    summaryData.push(['Female', reportData.summary.genderBreakdown.female]);
    summaryData.push(['Other', reportData.summary.genderBreakdown.other]);
  }
  
  // Add entity breakdown for attendance
  if (reportData.summary.entityBreakdown) {
    summaryData.push(['']);
    summaryData.push(['Attendance by Type']);
    Object.entries(reportData.summary.entityBreakdown).forEach(([type, data]: [string, { count: number; members: number; attended: number; rate: number; }]) => {
      summaryData.push([type, `${data.count} events, ${data.attended}/${data.members} (${data.rate}%)`]);
    });
  }
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
  
  // Save file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = (reportData: ReportData, filename: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(`${reportData.type.toUpperCase()} REPORT`, 14, 22);
  
  // Add generation info
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, 14, 32);
  doc.text(`Date Range: ${reportData.filters.startDate || 'N/A'} to ${reportData.filters.endDate || 'N/A'}`, 14, 38);
  
  // Add summary section
  doc.setFontSize(14);
  doc.text('Summary', 14, 48);
  
  doc.setFontSize(10);
  let yPos = 58;
  
  // Format summary data
  const addSummaryLine = (label: string, value: string | number) => {
    doc.text(`${label}: ${value}`, 20, yPos);
    yPos += 6;
  };
  
  addSummaryLine('Total Records', reportData.summary.totalRecords);
  
  if (reportData.summary.activeRecords !== undefined) {
    addSummaryLine('Active Records', reportData.summary.activeRecords);
  }
  if (reportData.summary.newRecords !== undefined) {
    addSummaryLine('New Records', reportData.summary.newRecords);
  }
  if (reportData.summary.attendanceRate !== undefined) {
    addSummaryLine('Attendance Rate', `${reportData.summary.attendanceRate}%`);
  }
  if (reportData.summary.averageAge !== undefined) {
    addSummaryLine('Average Age', reportData.summary.averageAge);
  }
  
  // Add gender breakdown
  if (reportData.summary.genderBreakdown) {
    yPos += 2;
    doc.text('Gender Breakdown:', 20, yPos);
    yPos += 6;
    addSummaryLine('  Male', reportData.summary.genderBreakdown.male);
    addSummaryLine('  Female', reportData.summary.genderBreakdown.female);
    addSummaryLine('  Other', reportData.summary.genderBreakdown.other);
  }
  
  // Add entity breakdown for attendance
  if (reportData.summary.entityBreakdown) {
    yPos += 2;
    doc.text('Attendance by Type:', 20, yPos);
    yPos += 6;
    Object.entries(reportData.summary.entityBreakdown).forEach(([type, data]: [string, { count: number; members: number; attended: number; rate: number; }]) => {
      addSummaryLine(`  ${type}`, `${data.count} events, ${data.attended}/${data.members} (${data.rate}%)`);
    });
  }
  
  // Add table
  yPos += 10;
  
  const tableColumn = getTableColumns(reportData.type);
  const tableRows = formatTableRows(reportData.data, reportData.type);
  
  (doc as any).autoTable({
    startY: yPos,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 10 } },
  });
  
  // Save PDF
  doc.save(`${filename}.pdf`);
};

const getTableColumns = (type: ReportType): string[] => {
  const baseColumns = ['#'];
  
  switch (type) {
    case 'members':
      return [...baseColumns, 'Membership No.', 'Full Name', 'Gender', 'Email', 'Phone', 'Status', 'Marital Status', 'Occupation'];
    case 'visitors':
      return [...baseColumns, 'Full Name', 'Gender', 'Email', 'Phone', 'Status', 'Baptized'];
    case 'families':
      return [...baseColumns, 'Family Name', 'Address', 'Members Count'];
    case 'attendance':
      return [...baseColumns, 'Date', 'Entity', 'Type', 'Present', 'Total', 'Rate'];
    case 'ministries':
      return [...baseColumns, 'Ministry Name', 'Leader', 'Meeting', 'Location', 'Members'];
    default:
      return baseColumns;
  }
};

const formatTableRows = (data: ReportRow[], type: ReportType): (string | number)[][] => {
  return data.map((item, index) => {
    const row: (string | number)[] = [index + 1];
    
    switch (type) {
      case 'members': {
        const member = item as Member;
        return [
          ...row,
          member.membershipNumber || 'N/A',
          member.fullName,
          member.gender,
          member.email,
          member.phone,
          member.status,
          member.maritalStatus || 'N/A',
          member.occupation || 'N/A',
        ];
      }
      case 'visitors': {
        const visitor = item as Visitor;
        return [
          ...row,
          visitor.fullName,
          visitor.gender,
          visitor.email,
          visitor.phone,
          visitor.status,
          visitor.baptism?.date ? 'Yes' : 'No',
        ];
      }
      case 'families': {
        const family = item as Family;
        return [
          ...row,
          family.familyName,
          family.address || 'N/A',
          family.members?.length || 0,
        ];
      }
      case 'attendance': {
        const record = item as AttendanceRecord;
        return [
          ...row,
          new Date(record.meetingDate).toLocaleDateString(),
          record.entityName,
          record.entityType,
          record.totalAttended || 0,
          record.totalMembers || 0,
          record.attendanceRate ? `${record.attendanceRate}%` : '0%',
        ];
      }
      case 'ministries': {
        const ministry = item as Ministry;
        return [
          ...row,
          ministry.name,
          ministry.leaderName,
          `${ministry.meetingDay || ''} ${ministry.meetingTime || ''}`.trim() || 'Not scheduled',
          ministry.meetingLocation || 'N/A',
          ministry.memberCount || 0,
        ];
      }
      default:
        return row;
    }
  });
};

// Helper function
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};