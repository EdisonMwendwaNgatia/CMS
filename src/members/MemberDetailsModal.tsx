import { useState } from "react";
import type { Member } from "./memberTypes";
import MemberStatusSelector from "./MemberStatusSelector";
import { updateMember } from "./memberService";

export default function MemberDetailsModal({
  member,
  onClose,
  onUpdated,
}: {
  member: Member;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [data, setData] = useState<Member>({ ...member });
  const [saving, setSaving] = useState(false);

  const modalStyle = {
    background: "white",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    padding: "30px",
    position: "relative" as const,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    paddingBottom: "15px",
    borderBottom: "2px solid #ecf0f1",
  };

  const titleStyle = {
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
  };

  const closeBtnStyle = {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#95a5a6",
    padding: "0 10px",
    lineHeight: "1",
  };

  const formGroupStyle = {
    marginBottom: "20px",
  };

  const labelStyle = {
    display: "block",
    fontWeight: "600",
    color: "#4b5563",
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "6px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const sectionTitleStyle = {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "25px 0 15px 0",
    paddingBottom: "8px",
    borderBottom: "2px solid #ecf0f1",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "2px solid #ecf0f1",
  };

  const saveButtonStyle = {
    flex: 2,
    padding: "12px 24px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s",
  };

  const cancelButtonStyle = {
    flex: 1,
    padding: "12px 24px",
    background: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleBaptismChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      baptism: {
        ...data.baptism,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMember(member.id!, data);
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update member:", error);
      alert("Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Edit Member Details</h3>
        <button 
          style={closeBtnStyle} 
          onClick={onClose}
          onMouseEnter={(e) => e.currentTarget.style.color = "#4b5563"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#95a5a6"}
        >
          ×
        </button>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Full Name</label>
        <input
          name="fullName"
          value={data.fullName}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Phone Number</label>
        <input
          name="phone"
          value={data.phone}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Email Address</label>
        <input
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Address</label>
        <input
          name="address"
          value={data.address}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Occupation</label>
        <input
          name="occupation"
          value={data.occupation}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Member Status</label>
        <MemberStatusSelector
          value={data.status}
          onChange={(status) => setData({ ...data, status })}
        />
      </div>

      <h4 style={sectionTitleStyle}>Baptism Information</h4>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Baptism Date</label>
        <input
          type="date"
          name="date"
          value={data.baptism?.date || ""}
          onChange={handleBaptismChange}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Baptism Place</label>
        <input
          name="place"
          placeholder="Place of baptism"
          value={data.baptism?.place || ""}
          onChange={handleBaptismChange}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Minister</label>
        <input
          name="minister"
          placeholder="Name of minister"
          value={data.baptism?.minister || ""}
          onChange={handleBaptismChange}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={buttonGroupStyle}>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{
            ...saveButtonStyle,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!saving) e.currentTarget.style.background = "#059669";
          }}
          onMouseLeave={(e) => {
            if (!saving) e.currentTarget.style.background = "#10b981";
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button 
          onClick={onClose}
          style={cancelButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = "#4b5563"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#6b7280"}
        >
          Close
        </button>
      </div>
    </div>
  );
}