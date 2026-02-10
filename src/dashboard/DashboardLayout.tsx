import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Members from "../members/Members";
import Visitors from "../visitors/Visitors";
import Ministries from "../ministries/Ministries";
import MinistryDetails from "../ministries/MinistryDetails";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "1.5rem" }}>
        <Routes>
          <Route path="/" element={<h1>Dashboard</h1>} />
          <Route path="members" element={<Members />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="ministries" element={<Ministries />} />
          <Route path="ministries/:ministryId" element={<MinistryDetails />} />
        </Routes>
      </main>
    </div>
  );
}
