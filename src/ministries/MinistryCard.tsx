import React from "react";
import { useNavigate } from "react-router-dom";
import type { Ministry } from "./ministryTypes";

interface MinistryCardProps {
  ministry: Ministry;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

const MinistryCard: React.FC<MinistryCardProps> = ({ 
  ministry, 
  onDelete,
  isDeleting = false
}) => {
  const navigate = useNavigate();

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      Sunday: "#ef4444",
      Monday: "#3b82f6",
      Tuesday: "#10b981",
      Wednesday: "#f59e0b",
      Thursday: "#8b5cf6",
      Friday: "#06b6d4",
      Saturday: "#ec4899"
    };
    return colors[day] || "#64748b";
  };

  const handleCardClick = () => {
    if (ministry.id) {
      navigate(`/dashboard/ministries/${ministry.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ministry.id && onDelete && !isDeleting) {
      onDelete(ministry.id);
    }
  };

  const cardStyle = {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
    overflow: "hidden" as const,
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "1px solid #f1f5f9",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  };

  const headerStyle = {
    background: getDayColor(ministry.meetingDay),
    padding: "24px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const headerTitleStyle = {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "white",
    lineHeight: 1.3,
  };

  const memberCountStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.2)",
    padding: "6px 12px",
    borderRadius: "40px",
    fontSize: "0.9rem",
  };

  const countBadgeStyle = {
    background: "white",
    color: headerStyle.background,
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: "bold",
  };

  const bodyStyle = {
    padding: "24px",
    flex: 1,
  };

  const descriptionStyle = {
    color: "#475569",
    lineHeight: "1.6",
    marginBottom: "20px",
    fontSize: "0.95rem",
  };

  const detailsStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  };

  const detailItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "0.95rem",
  };

  const detailLabelStyle = {
    fontWeight: "600",
    color: "#64748b",
    minWidth: "70px",
    fontSize: "0.9rem",
  };

  const detailValueStyle = {
    color: "#0f172a",
    flex: 1,
  };

  const emailStyle = {
    ...detailValueStyle,
    wordBreak: "break-all" as const,
    color: "#2563eb",
  };

  const meetingInfoStyle = {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  };

  const dayBadgeStyle = {
    background: getDayColor(ministry.meetingDay),
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  };

  const timeBadgeStyle = {
    background: "#f1f5f9",
    color: "#475569",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "500",
  };

  const footerStyle = {
    padding: "20px 24px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const viewDetailsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#3b82f6",
    fontWeight: "500",
    fontSize: "0.95rem",
    transition: "gap 0.2s",
  };

  const deleteBtnStyle = {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const deleteBtnDisabledStyle = {
    ...deleteBtnStyle,
    background: "#94a3b8",
    cursor: "not-allowed",
  };

  const spinnerStyle = {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "6px",
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div 
        style={cardStyle}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 20px 30px -10px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1)";
        }}
      >
        <div style={headerStyle}>
          <h3 style={headerTitleStyle}>{ministry.name}</h3>
          <div style={memberCountStyle}>
            <span style={countBadgeStyle}>{ministry.memberCount}</span>
            <span>members</span>
          </div>
        </div>
        
        <div style={bodyStyle}>
          <p style={descriptionStyle}>{ministry.description}</p>
          
          <div style={detailsStyle}>
            <div style={detailItemStyle}>
              <span style={detailLabelStyle}>Leader:</span>
              <span style={detailValueStyle}>{ministry.leaderName}</span>
            </div>
            
            <div style={detailItemStyle}>
              <span style={detailLabelStyle}>Email:</span>
              <span style={emailStyle}>{ministry.leaderEmail}</span>
            </div>
            
            <div style={detailItemStyle}>
              <span style={detailLabelStyle}>Meets:</span>
              <div style={meetingInfoStyle}>
                <span style={dayBadgeStyle}>{ministry.meetingDay}</span>
                <span style={timeBadgeStyle}>{ministry.meetingTime}</span>
              </div>
            </div>
            
            <div style={detailItemStyle}>
              <span style={detailLabelStyle}>Location:</span>
              <span style={detailValueStyle}>{ministry.meetingLocation}</span>
            </div>
          </div>
        </div>
        
        <div style={footerStyle}>
          <span style={viewDetailsStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            View Details
          </span>
          {onDelete && (
            <button 
              style={isDeleting ? deleteBtnDisabledStyle : deleteBtnStyle}
              onClick={handleDeleteClick}
              disabled={isDeleting}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                }
              }}
            >
              {isDeleting ? (
                <>
                  <span style={spinnerStyle}></span>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MinistryCard;