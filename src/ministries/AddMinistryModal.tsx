import React, { useState } from "react";
import type { MinistryInput } from "./ministryTypes";

interface AddMinistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMinistry: (ministry: MinistryInput) => Promise<void>;
}

const AddMinistryModal: React.FC<AddMinistryModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddMinistry 
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meetingDays = [
    "Sunday",
    "Monday", 
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onAddMinistry({
        name,
        description,
        leaderName,
        leaderEmail,
        meetingDay,
        meetingTime,
        meetingLocation,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setLeaderName("");
      setLeaderEmail("");
      setMeetingDay("");
      setMeetingTime("");
      setMeetingLocation("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add ministry");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease",
  };

  const modalContentStyle = {
    background: "white",
    borderRadius: "24px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    animation: "slideUp 0.3s ease",
  };

  const modalHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px",
    borderBottom: "1px solid #e2e8f0",
  };

  const modalTitleStyle = {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0,
  };

  const closeBtnStyle = {
    background: "none",
    border: "none",
    fontSize: "1.8rem",
    cursor: "pointer",
    color: "#64748b",
    padding: "4px 12px",
    borderRadius: "8px",
    transition: "all 0.2s",
    lineHeight: 1,
  };

  const formStyle = {
    padding: "28px",
  };

  const errorMessageStyle = {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "14px 18px",
    borderRadius: "12px",
    marginBottom: "24px",
    borderLeft: "4px solid #ef4444",
    fontSize: "0.95rem",
  };

  const formGroupStyle = {
    marginBottom: "24px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#475569",
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "1rem",
    transition: "all 0.2s",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const textareaStyle = {
    ...inputStyle,
    resize: "vertical" as const,
    minHeight: "100px",
    fontFamily: "inherit",
  };

  const selectStyle = {
    ...inputStyle,
    background: "white",
    cursor: "pointer",
  };

  const formRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "24px",
  };

  const modalFooterStyle = {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "32px",
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0",
  };

  const cancelBtnStyle = {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const submitBtnStyle = {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
  };

  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle}>
          <div style={modalHeaderStyle}>
            <h2 style={modalTitleStyle}>Add New Ministry</h2>
            <button 
              style={closeBtnStyle}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
                e.currentTarget.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={formStyle}>
            {error && (
              <div style={errorMessageStyle}>
                {error}
              </div>
            )}
            
            <div style={formGroupStyle}>
              <label htmlFor="name" style={labelStyle}>Ministry Name *</label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Worship Team, Youth Ministry"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="description" style={labelStyle}>Description *</label>
              <textarea
                id="description"
                placeholder="Describe the purpose and activities of this ministry"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                required
                style={textareaStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="leaderName" style={labelStyle}>Leader Name *</label>
              <input
                id="leaderName"
                type="text"
                placeholder="Enter leader's full name"
                value={leaderName}
                onChange={e => setLeaderName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="leaderEmail" style={labelStyle}>Leader Email *</label>
              <input
                id="leaderEmail"
                type="email"
                placeholder="leader@example.com"
                value={leaderEmail}
                onChange={e => setLeaderEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
            
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="meetingDay" style={labelStyle}>Meeting Day *</label>
                <select
                  id="meetingDay"
                  value={meetingDay}
                  onChange={e => setMeetingDay(e.target.value)}
                  required
                  style={selectStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  <option value="">Select Day</option>
                  {meetingDays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div style={formGroupStyle}>
                <label htmlFor="meetingTime" style={labelStyle}>Meeting Time *</label>
                <input
                  id="meetingTime"
                  type="time"
                  value={meetingTime}
                  onChange={e => setMeetingTime(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                />
              </div>
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="meetingLocation" style={labelStyle}>Meeting Location *</label>
              <input
                id="meetingLocation"
                type="text"
                placeholder="e.g., Main Sanctuary, Room 201"
                value={meetingLocation}
                onChange={e => setMeetingLocation(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
            
            <div style={modalFooterStyle}>
              <button 
                type="button" 
                style={cancelBtnStyle}
                onClick={onClose}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={submitBtnStyle}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#3b82f6";
                }}
              >
                {loading ? "Adding..." : "Add Ministry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddMinistryModal;