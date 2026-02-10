import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h3>Church Admin</h3>

      <button onClick={() => navigate("/dashboard/members")}>Members</button>

      <button onClick={() => navigate("/dashboard/visitors")}>Visitors</button>
      <button disabled>Attendance</button>
      <button onClick={() => navigate("/dashboard/ministries")}>
        Ministries
      </button>
      <button disabled>Reports</button>
    </aside>
  );
}
