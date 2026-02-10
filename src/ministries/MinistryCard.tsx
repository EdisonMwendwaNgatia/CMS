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
      Sunday: "#e74c3c",
      Monday: "#3498db",
      Tuesday: "#2ecc71",
      Wednesday: "#f39c12",
      Thursday: "#9b59b6",
      Friday: "#1abc9c",
      Saturday: "#e67e22"
    };
    return colors[day] || "#95a5a6";
  };

  const handleCardClick = () => {
    if (ministry.id) {
      navigate(`/dashboard/ministries/${ministry.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking delete
    if (ministry.id && onDelete && !isDeleting) {
      onDelete(ministry.id);
    }
  };

  return (
    <div 
      className="ministry-card clickable" 
      onClick={handleCardClick}
    >
      <div 
        className="ministry-card-header"
        style={{ backgroundColor: getDayColor(ministry.meetingDay) }}
      >
        <h3>{ministry.name}</h3>
        <div className="member-count">
          <span className="count-badge">{ministry.memberCount}</span>
          <span>members</span>
        </div>
      </div>
      
      <div className="ministry-card-body">
        <p className="ministry-description">{ministry.description}</p>
        
        <div className="ministry-details">
          <div className="detail-item">
            <span className="detail-label">Leader:</span>
            <span className="detail-value">{ministry.leaderName}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value email">{ministry.leaderEmail}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Meets:</span>
            <div className="meeting-info">
              <span className="day-badge">{ministry.meetingDay}</span>
              <span className="time-badge">{ministry.meetingTime}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{ministry.meetingLocation}</span>
          </div>
        </div>
      </div>
      
      <div className="ministry-card-footer">
        <span className="view-details">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          View Details
        </span>
        {onDelete && (
          <button 
            className={`btn-delete ${isDeleting ? 'deleting' : ''}`} 
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MinistryCard;