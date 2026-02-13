import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const sidebarStyle = {
    width: "250px",
    backgroundColor: "#2c3e50",
    color: "white",
    padding: "20px 0",
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    position: "sticky" as const,
    top: 0,
    left: 0,
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
  };

  const titleStyle = {
    padding: "0 20px 20px 20px",
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "600",
    borderBottom: "1px solid #34495e",
    color: "#ecf0f1",
    textAlign: "center" as const,
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px 20px",
    margin: "2px 0",
    border: "none",
    backgroundColor: "transparent",
    color: "#ecf0f1",
    textAlign: "left" as const,
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "all 0.3s",
    borderLeft: "3px solid transparent",
  };

  const markAttendanceBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#27ae60",
    color: "white",
    fontWeight: "600",
    borderLeft: "3px solid #2ecc71",
  };

  return (
    <aside style={sidebarStyle}>
      <h3 style={titleStyle}>Deliverance Church Olepolos</h3>

      <button
        style={buttonStyle}
        onClick={() => navigate("/dashboard/members")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#34495e";
          e.currentTarget.style.borderLeft = "3px solid #3498db";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderLeft = "3px solid transparent";
        }}
      >
        Members
      </button>

      <button
        style={buttonStyle}
        onClick={() => navigate("/dashboard/visitors")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#34495e";
          e.currentTarget.style.borderLeft = "3px solid #3498db";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderLeft = "3px solid transparent";
        }}
      >
        Visitors
      </button>
      
      <button
        style={buttonStyle}
        onClick={() => navigate("/dashboard/ministries")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#34495e";
          e.currentTarget.style.borderLeft = "3px solid #3498db";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderLeft = "3px solid transparent";
        }}
      >
        Ministries
      </button>
      
      <button
        style={buttonStyle}
        onClick={() => navigate("/dashboard/attendance")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#34495e";
          e.currentTarget.style.borderLeft = "3px solid #3498db";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderLeft = "3px solid transparent";
        }}
      >
        Attendance History
      </button>

      <button
        style={markAttendanceBtnStyle}
        onClick={() => navigate("/dashboard/mark-attendance")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2ecc71";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#27ae60";
        }}
      >
        Mark Attendance
      </button>

      <button
        style={buttonStyle}
        onClick={() => navigate("/dashboard/families")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#34495e";
          e.currentTarget.style.borderLeft = "3px solid #3498db";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderLeft = "3px solid transparent";
        }}
      >
        Families
      </button>

      <button
        style={buttonStyle}
        onClick={() => navigate("/dashboard/reports")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#34495e";
          e.currentTarget.style.borderLeft = "3px solid #3498db";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderLeft = "3px solid transparent";
        }}
      >
        Reports
      </button>
    </aside>
  );
}