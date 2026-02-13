import React, { useState } from "react";
import type { Visitor } from "./visitorTypes";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface VisitorDetailsModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const VisitorDetailsModal: React.FC<VisitorDetailsModalProps> = ({ 
  visitor, 
  isOpen, 
  onClose, 
  onUpdated 
}) => {
  const [baptismDate, setBaptismDate] = useState("");
  const [baptismPlace, setBaptismPlace] = useState("");
  const [baptismMinister, setBaptismMinister] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visitor && visitor.baptism) {
      setBaptismDate(visitor.baptism.date || "");
      setBaptismPlace(visitor.baptism.place || "");
      setBaptismMinister(visitor.baptism.minister || "");
    } else {
      setBaptismDate("");
      setBaptismPlace("");
      setBaptismMinister("");
    }
  }, [visitor]);

  if (!isOpen || !visitor) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const ref = doc(db, "visitors", visitor.id!);
      await updateDoc(ref, {
        baptism: {
          date: baptismDate,
          place: baptismPlace,
          minister: baptismMinister,
        },
      });
      setSaving(false);
      if (onUpdated) onUpdated();
      onClose();
    } catch {
      setError("Failed to save baptism details");
      setSaving(false);
    }
  };

  const modalOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
  };

  const titleStyle = {
    fontSize: "1.8rem",
    color: "#2c3e50",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid #f0f0f0",
  };

  const infoContainerStyle = {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "25px",
  };

  const infoRowStyle = {
    marginBottom: "12px",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center" as const,
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#7f8c8d",
    width: "80px",
    display: "inline-block",
  };

  const valueStyle = {
    color: "#2c3e50",
    flex: 1,
  };

  const sectionTitleStyle = {
    fontSize: "1.3rem",
    color: "#2c3e50",
    marginBottom: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "15px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s",
    outline: "none",
    boxSizing: "border-box" as const,
  };


  const buttonContainerStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  };

  const saveButtonStyle = {
    flex: 2,
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  };

  const cancelButtonStyle = {
    flex: 1,
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  };

  const errorStyle = {
    backgroundColor: "#fee",
    color: "#e74c3c",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "0.95rem",
    borderLeft: "4px solid #e74c3c",
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Visitor Details</h2>
        
        <div style={infoContainerStyle}>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Name:</span>
            <span style={valueStyle}>{visitor.fullName}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Email:</span>
            <span style={valueStyle}>{visitor.email}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Phone:</span>
            <span style={valueStyle}>{visitor.phone}</span>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <h3 style={sectionTitleStyle}>Baptism Details</h3>
          
          <input
            type="date"
            placeholder="Baptism Date"
            value={baptismDate}
            onChange={e => setBaptismDate(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3498db";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          
          <input
            type="text"
            placeholder="Baptism Place"
            value={baptismPlace}
            onChange={e => setBaptismPlace(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3498db";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          
          <input
            type="text"
            placeholder="Minister"
            value={baptismMinister}
            onChange={e => setBaptismMinister(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3498db";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          
          {error && <div style={errorStyle}>{error}</div>}
          
          <div style={buttonContainerStyle}>
            <button
              type="submit"
              disabled={saving}
              style={saveButtonStyle}
              onMouseEnter={(e) => {
                if (!saving) e.currentTarget.style.backgroundColor = "#27ae60";
              }}
              onMouseLeave={(e) => {
                if (!saving) e.currentTarget.style.backgroundColor = "#2ecc71";
              }}
            >
              {saving ? "Saving..." : "Save Baptism Details"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={cancelButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#7f8c8d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#95a5a6";
              }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitorDetailsModal;