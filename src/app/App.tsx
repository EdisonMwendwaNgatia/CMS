import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/Login";
import DashboardLayout from "../dashboard/DashboardLayout";
import RequireAuth from "../auth/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard/*"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
