import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <h3>Deliverance Church Olepolos</h3>

      <button onClick={() => navigate("/dashboard/members")}>
        Members
      </button>

      <button onClick={() => navigate("/dashboard/visitors")}>
        Visitors
      </button>
      
      <button onClick={() => navigate("/dashboard/ministries")}>
        Ministries
      </button>
      
      <button onClick={() => navigate("/dashboard/attendance")}> 
        Attendance History
      </button>

      <button 
        onClick={() => navigate("/dashboard/mark-attendance")}
        >
        Mark Attendance
      </button>

      <button onClick={() => navigate("/dashboard/families")}>Families</button>

      <button onClick={() => navigate("/dashboard/reports")}>Reports</button>
    </aside>
  );
}