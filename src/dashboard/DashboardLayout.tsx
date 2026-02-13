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
  const layoutStyle = {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f5f7fa",
  };

  const mainContentStyle = {
    flex: 1,
    padding: "1.5rem",
    overflowY: "auto" as const,
    backgroundColor: "#f5f7fa",
  };

  const headerStyle = {
    marginBottom: "1.5rem",
    padding: "1rem 1.5rem",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    borderLeft: "4px solid #3498db",
  };

  const headerTitleStyle = {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#2c3e50",
  };

  const contentAreaStyle = {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    minHeight: "calc(100vh - 120px)",
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />

      <main style={mainContentStyle}>
        <header style={headerStyle}>
          <h2 style={headerTitleStyle}>Deliverance Church Olepolos</h2>
        </header>
        
        <div style={contentAreaStyle}>
          <Routes>
            <Route path="/" element={<h1 style={{ color: "#2c3e50", margin: 0 }}>Dashboard</h1>} />
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
        </div>
      </main>
    </div>
  );
}