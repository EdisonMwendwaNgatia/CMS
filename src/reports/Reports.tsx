import React, { useEffect, useState, useRef } from "react";
import {
  fetchAllMembers,
  fetchAllFamilies,
  fetchAllMinistries,
  fetchAllVisitors,
  fetchAllCellGroupAttendance,
  fetchAllMinistryAttendance,
} from "./reportsService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Member } from "../members/memberTypes";
import type { Family } from "../families/familyTypes";
import type { Ministry } from "../ministries/ministryTypes";
import type { Visitor } from "../visitors/visitorTypes";
import type { AttendanceRecord } from "../attendance/attendanceTypes";

const Reports: React.FC = () => {
  const formatDate = (value: unknown): string => {
    if (!value) return "";
    // Firestore Timestamp object shape { seconds, nanoseconds }
    if (typeof value === "object" && value !== null) {
      const v = value as Record<string, unknown>;
      if ("seconds" in v && "nanoseconds" in v && typeof v.seconds === "number") {
        return new Date((v.seconds as number) * 1000).toLocaleString();
      }
      if (typeof v.toDate === "function") {
        try {
          return (v.toDate as () => Date)().toLocaleString();
        } catch {
          return String(value);
        }
      }
    }
    if (typeof value === "string") return value;
    return String(value);
  };
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [cellAttendance, setCellAttendance] = useState<AttendanceRecord[]>([]);
  const [ministryAttendance, setMinistryAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [m, f, mi, v, ca, ma] = await Promise.all([
          fetchAllMembers(),
          fetchAllFamilies(),
          fetchAllMinistries(),
          fetchAllVisitors(),
          fetchAllCellGroupAttendance(),
          fetchAllMinistryAttendance(),
        ]);

        setMembers(m || []);
        setFamilies(f || []);
        setMinistries(mi || []);
        setVisitors(v || []);
        setCellAttendance(ca || []);
        setMinistryAttendance(ma || []);
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalMembers = members.length;
  const totalFamilies = families.length;
  const totalMinistries = ministries.length;
  const totalVisitors = visitors.length;

  const totalCellAttendanceRecords = cellAttendance.length;
  const totalMinistryAttendanceRecords = ministryAttendance.length;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const membersSheet = XLSX.utils.json_to_sheet(members.map((m) => ({
      id: m.id,
      fullName: m.fullName,
      membershipNumber: m.membershipNumber,
      phone: m.phone,
      email: m.email,
      status: m.status,
    })));
    XLSX.utils.book_append_sheet(wb, membersSheet, "Members");

    const familiesSheet = XLSX.utils.json_to_sheet(families.map((f) => ({
      id: f.id,
      familyName: f.familyName,
      address: f.address || "",
  memberCount: Array.isArray(f.members) ? f.members.length : undefined,
    })));
    XLSX.utils.book_append_sheet(wb, familiesSheet, "Families");

    const ministriesSheet = XLSX.utils.json_to_sheet(ministries.map((mi) => ({
      id: mi.id,
      name: mi.name,
      leaderName: mi.leaderName,
      leaderEmail: mi.leaderEmail || "",
      memberCount: mi.memberCount,
    })));
    XLSX.utils.book_append_sheet(wb, ministriesSheet, "Ministries");

    const visitorsSheet = XLSX.utils.json_to_sheet(visitors.map((v) => ({
      id: v.id,
      name: v.fullName,
      phone: v.phone,
      email: v.email,
      visitedAt: formatDate(v.createdAt),
    })));
    XLSX.utils.book_append_sheet(wb, visitorsSheet, "Visitors");

    const cellAttSheet = XLSX.utils.json_to_sheet(cellAttendance.map((c) => ({
      id: c.id,
      entityName: c.entityName,
      entityType: c.entityType,
      meetingDate: formatDate(c.meetingDate),
      totalAttended: c.totalAttended,
      totalMembers: c.totalMembers,
      attendanceRate: c.attendanceRate,
      createdAt: formatDate(c.createdAt),
    })));
    XLSX.utils.book_append_sheet(wb, cellAttSheet, "Cell Attendance");

    const minAttSheet = XLSX.utils.json_to_sheet(ministryAttendance.map((c) => ({
      id: c.id,
      entityName: c.entityName,
      entityType: c.entityType,
      meetingDate: formatDate(c.meetingDate),
      totalAttended: c.totalAttended,
      totalMembers: c.totalMembers,
      attendanceRate: c.attendanceRate,
      createdAt: formatDate(c.createdAt),
    })));
    XLSX.utils.book_append_sheet(wb, minAttSheet, "Ministry Attendance");

    XLSX.writeFile(wb, `church-reports-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const imgProps = (pdf as unknown as { getImageProperties: (img: string) => { width: number; height: number } }).getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`church-reports-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (loading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Reports</h1>
        <div>
          <button onClick={exportExcel} style={{ marginRight: 10 }}>Export Excel</button>
          <button onClick={exportPDF}>Export PDF</button>
        </div>
      </div>

      <div ref={reportRef} style={{ background: "white", padding: 20, borderRadius: 8 }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <h3>Total Members</h3>
            <p style={{ fontSize: 24, margin: 0 }}>{totalMembers}</p>
          </div>

          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <h3>Total Families</h3>
            <p style={{ fontSize: 24, margin: 0 }}>{totalFamilies}</p>
          </div>

          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <h3>Total Ministries</h3>
            <p style={{ fontSize: 24, margin: 0 }}>{totalMinistries}</p>
          </div>

          <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <h3>Total Visitors</h3>
            <p style={{ fontSize: 24, margin: 0 }}>{totalVisitors}</p>
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3>Attendance Summary</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 6 }}>
              <strong>Cell Attendance Records:</strong>
              <div>{totalCellAttendanceRecords}</div>
            </div>
            <div style={{ padding: 12, background: "#f8f9fa", borderRadius: 6 }}>
              <strong>Ministry Attendance Records:</strong>
              <div>{totalMinistryAttendanceRecords}</div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3>Recent Visitors</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Name</th>
                <th style={{ padding: 8 }}>Phone</th>
                <th style={{ padding: 8 }}>Email</th>
                <th style={{ padding: 8 }}>Visit</th>
              </tr>
            </thead>
            <tbody>
              {visitors.slice(0, 10).map((v) => (
                <tr key={v.id}>
                  <td style={{ padding: 8 }}>{v.fullName}</td>
                  <td style={{ padding: 8 }}>{v.phone}</td>
                  <td style={{ padding: 8 }}>{v.email}</td>
                  <td style={{ padding: 8 }}>{formatDate(v.createdAt) || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3>Recent Attendance (Cell Groups)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Group</th>
                <th style={{ padding: 8 }}>Date</th>
                <th style={{ padding: 8 }}>Present</th>
                <th style={{ padding: 8 }}>Members</th>
                <th style={{ padding: 8 }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {cellAttendance.slice(0, 10).map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 8 }}>{r.entityName}</td>
                  <td style={{ padding: 8 }}>{formatDate(r.meetingDate)}</td>
                  <td style={{ padding: 8 }}>{r.totalAttended}</td>
                  <td style={{ padding: 8 }}>{r.totalMembers}</td>
                  <td style={{ padding: 8 }}>{r.attendanceRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3>Members (first 20)</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Membership #</th>
                <th style={{ padding: 8 }}>Name</th>
                <th style={{ padding: 8 }}>Phone</th>
                <th style={{ padding: 8 }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {members.slice(0, 20).map((m) => (
                <tr key={m.id}>
                  <td style={{ padding: 8 }}>{m.membershipNumber}</td>
                  <td style={{ padding: 8 }}>{m.fullName}</td>
                  <td style={{ padding: 8 }}>{m.phone}</td>
                  <td style={{ padding: 8 }}>{m.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Reports;
