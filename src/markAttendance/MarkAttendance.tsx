import React from "react";
import { useNavigate } from "react-router-dom";

const MarkAttendance: React.FC = () => {
  const navigate = useNavigate();

  const containerStyle = {
    padding: "40px",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const headerStyle = {
    marginBottom: "40px",
  };

  const titleStyle = {
    color: "#2c3e50",
    fontSize: "2rem",
    marginBottom: "10px",
  };

  const subtitleStyle = {
    color: "#7f8c8d",
    fontSize: "1.1rem",
  };

  const cardsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginTop: "30px",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "15px",
    padding: "40px 30px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
    textAlign: "center" as const,
  };

  const iconStyle = {
    fontSize: "48px",
    marginBottom: "20px",
  };

  const cardTitleStyle = {
    fontSize: "1.5rem",
    color: "#2c3e50",
    marginBottom: "15px",
  };

  const cardDescStyle = {
    color: "#7f8c8d",
    lineHeight: "1.6",
  };

  const handleSundayService = () => {
    navigate("/dashboard/mark-attendance/sunday-service");
  };

  const handleCellGroup = () => {
    navigate("/dashboard/mark-attendance/cell-group");
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Mark Attendance</h1>
        <p style={subtitleStyle}>
          Select the type of attendance you want to mark
        </p>
      </div>

      <div style={cardsGridStyle}>
        {/* Sunday Service Card */}
        <div
          style={cardStyle}
          onClick={handleSundayService}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div style={iconStyle}>⛪</div>
          <h2 style={cardTitleStyle}>Sunday Service</h2>
          <p style={cardDescStyle}>
            Mark attendance for main church services.
            <br />
            Track members attending Sunday worship.
          </p>
        </div>

        {/* Cell Group Card */}
        <div
          style={cardStyle}
          onClick={handleCellGroup}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div style={iconStyle}>👥</div>
          <h2 style={cardTitleStyle}>Cell Group</h2>
          <p style={cardDescStyle}>
            Mark attendance for small groups.
            <br />
            Select a cell group and track member participation.
          </p>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/dashboard/mark-attendance/cell-groups");
              }}
              style={{
                background: "none",
                border: "1px solid #3498db",
                color: "#3498db",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.9rem",
                marginRight: "10px",
              }}
            >
              Manage Cell Groups
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
