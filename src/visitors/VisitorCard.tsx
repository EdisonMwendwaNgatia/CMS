import React from "react";
import type { Visitor } from "./visitorTypes";

interface VisitorCardProps {
  visitor: Visitor;
  onStatusChange?: (visitorId: string) => void;
}

const VisitorCard: React.FC<VisitorCardProps> = ({ visitor, onStatusChange }) => {
  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
    cursor: "pointer",
    border: "1px solid #f0f0f0",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  };

  const nameStyle = {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const detailStyle = {
    fontSize: "0.85rem",
    color: "#7f8c8d",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const statusBadgeStyle = {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
    backgroundColor: visitor.status === "pre_member" ? "#fff3cd" : "#d4edda",
    color: visitor.status === "pre_member" ? "#856404" : "#155724",
    width: "fit-content",
  };

  const buttonStyle = {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "4px",
    fontSize: "0.8rem",
    cursor: "pointer",
    marginTop: "6px",
    transition: "background 0.2s",
    width: "100%",
  };

  const iconStyle = {
    fontSize: "0.9rem",
    opacity: 0.7,
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
      }}
    >
      <h3 style={nameStyle}>{visitor.fullName}</h3>
      
      <div style={detailStyle}>
        <span style={iconStyle}>📞</span>
        <span>{visitor.phone}</span>
      </div>
      
      <div style={detailStyle}>
        <span style={iconStyle}>✉️</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{visitor.email}</span>
      </div>
      
      <div style={detailStyle}>
        <span style={iconStyle}>📍</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{visitor.address}</span>
      </div>
      
      <div style={detailStyle}>
        <span style={iconStyle}>⚲</span>
        <span>{visitor.gender}</span>
      </div>
      
      <div style={detailStyle}>
        <span style={iconStyle}>🎂</span>
        <span>{visitor.dob}</span>
      </div>
      
      <div style={detailStyle}>
        <span style={iconStyle}>📊</span>
        <span style={statusBadgeStyle}>
          {visitor.status === "pre_member" ? "Visitor" : "Member"}
        </span>
      </div>
      
      {visitor.status === "pre_member" && onStatusChange && visitor.id && (
        <button
          style={buttonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(visitor.id!);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2980b9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#3498db";
          }}
        >
          Convert to Member
        </button>
      )}
    </div>
  );
};

export default VisitorCard;