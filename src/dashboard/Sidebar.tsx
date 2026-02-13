import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Function to determine if a route is active
  const isActive = (path: string) => {
    if (path === "/dashboard/mark-attendance") {
      return location.pathname.includes("/dashboard/mark-attendance");
    }
    return location.pathname === path;
  };

  // Style for active button
  const getButtonStyle = (path: string) => {
    const active = isActive(path);
    return {
      width: "100%",
      padding: "12px 20px",
      margin: "2px 0",
      border: "none",
      backgroundColor: active ? "#34495e" : "transparent",
      color: active ? "#3498db" : "#ecf0f1",
      textAlign: "left" as const,
      cursor: "pointer",
      fontSize: "0.95rem",
      transition: "all 0.3s",
      borderLeft: active ? "3px solid #3498db" : "3px solid transparent",
      fontWeight: active ? "500" : "normal",
    };
  };

  const handleTitleClick = () => {
    navigate("/dashboard");
  };


  return (
    <aside style={sidebarStyle}>
      <h3 style={titleStyle} onClick={handleTitleClick}>Deliverance Church Olepolos</h3>

      <button
        style={getButtonStyle("/dashboard/members")}
        onClick={() => navigate("/dashboard/members")}
        onMouseEnter={(e) => {
          if (!isActive("/dashboard/members")) {
            e.currentTarget.style.backgroundColor = "#34495e";
            e.currentTarget.style.borderLeft = "3px solid #3498db";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/dashboard/members")) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderLeft = "3px solid transparent";
          }
        }}
      >
        Members
      </button>

      <button
        style={getButtonStyle("/dashboard/visitors")}
        onClick={() => navigate("/dashboard/visitors")}
        onMouseEnter={(e) => {
          if (!isActive("/dashboard/visitors")) {
            e.currentTarget.style.backgroundColor = "#34495e";
            e.currentTarget.style.borderLeft = "3px solid #3498db";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/dashboard/visitors")) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderLeft = "3px solid transparent";
          }
        }}
      >
        Visitors
      </button>
      
      <button
        style={getButtonStyle("/dashboard/ministries")}
        onClick={() => navigate("/dashboard/ministries")}
        onMouseEnter={(e) => {
          if (!isActive("/dashboard/ministries")) {
            e.currentTarget.style.backgroundColor = "#34495e";
            e.currentTarget.style.borderLeft = "3px solid #3498db";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/dashboard/ministries")) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderLeft = "3px solid transparent";
          }
        }}
      >
        Ministries
      </button>
      
      <button
        style={getButtonStyle("/dashboard/attendance")}
        onClick={() => navigate("/dashboard/attendance")}
        onMouseEnter={(e) => {
          if (!isActive("/dashboard/attendance")) {
            e.currentTarget.style.backgroundColor = "#34495e";
            e.currentTarget.style.borderLeft = "3px solid #3498db";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/dashboard/attendance")) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderLeft = "3px solid transparent";
          }
        }}
      >
        Attendance History
      </button>

      <button
        style={getButtonStyle("/dashboard/mark-attendance")}
        onClick={() => navigate("/dashboard/mark-attendance")}
        onMouseEnter={(e) => {
          if (!isActive("/dashboard/mark-attendance")) {
            e.currentTarget.style.backgroundColor = "#34495e";
            e.currentTarget.style.borderLeft = "3px solid #3498db";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/dashboard/mark-attendance")) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderLeft = "3px solid transparent";

          }
        }}
      >
        Mark Attendance
      </button>

      <button
        style={getButtonStyle("/dashboard/families")}
        onClick={() => navigate("/dashboard/families")}
        onMouseEnter={(e) => {
          if (!isActive("/dashboard/families")) {
            e.currentTarget.style.backgroundColor = "#34495e";
            e.currentTarget.style.borderLeft = "3px solid #3498db";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/dashboard/families")) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderLeft = "3px solid transparent";
          }
        }}
      >
        Families
      </button>

      <button
        style={getButtonStyle("/dashboard/reports")}
        onClick={() => navigate("/dashboard/reports")}
        onMouseEnter={(e) => {
          if (!isActive("/dashboard/reports")) {
            e.currentTarget.style.backgroundColor = "#34495e";
            e.currentTarget.style.borderLeft = "3px solid #3498db";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive("/dashboard/reports")) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderLeft = "3px solid transparent";
          }
        }}
      >
        Reports
      </button>
    </aside>
  );
}