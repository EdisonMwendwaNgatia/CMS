import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Members from "../members/Members";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "1.5rem" }}>
        <Routes>
          <Route path="/" element={<h1>Dashboard</h1>} />
          <Route path="members" element={<Members />} />
        </Routes>
      </main>
    </div>
  );
}
