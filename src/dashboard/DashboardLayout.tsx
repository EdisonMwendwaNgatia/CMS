import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Members from "../members/Members";
import Visitors from "../visitors/Visitors";
import Ministries from "../ministries/Ministries";
import MinistryDetails from "../ministries/MinistryDetails";
import Attendance from "../attendance/Attendance";
import Families from "../families/Families";
import MarkAttendance from "../markAttendance/MarkAttendance";
import SundayServiceAttendance from "../markAttendance/SundayServiceAttendance";
import CellGroupAttendance from "../markAttendance/CellGroupAttendance";
import CellGroups from "../markAttendance/CellGroups";
import Reports from "../reports/Reports";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "1.5rem" }}>
        <header style={{ marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Deliverance Church Olepolos</h2>
        </header>
        <Routes>
          <Route path="/" element={<h1>Dashboard</h1>} />
          <Route path="members" element={<Members />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="ministries" element={<Ministries />} />
          <Route path="ministries/:ministryId" element={<MinistryDetails />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="families" element={<Families />} />
          <Route path="mark-attendance" element={<MarkAttendance />} />
          <Route path="mark-attendance/sunday-service" element={<SundayServiceAttendance />} />
          <Route path="mark-attendance/cell-group" element={<CellGroupAttendance />} />
          <Route path="mark-attendance/cell-groups" element={<CellGroups />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}