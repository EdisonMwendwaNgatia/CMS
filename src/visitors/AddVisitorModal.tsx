import React, { useState } from "react";
import type { Visitor } from "./visitorTypes";

interface AddVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVisitor: (visitor: Omit<Visitor, "id" | "status">) => void;
}

const AddVisitorModal: React.FC<AddVisitorModalProps> = ({ isOpen, onClose, onAddVisitor }) => {
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVisitor({ fullName, phone, email, address, gender, dob });
    setFullName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setGender("");
    setDob("");
    onClose();
  };

  if (!isOpen) return null;

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
    borderRadius: "10px",
    padding: "25px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  };

  const titleStyle = {
    fontSize: "1.5rem",
    color: "#2c3e50",
    margin: 0,
  };

  const closeButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#7f8c8d",
    padding: "0 5px",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
  };

  const inputStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "0.95rem",
    transition: "border-color 0.2s",
  };

  const selectStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "0.95rem",
    backgroundColor: "white",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  };

  const submitButtonStyle = {
    flex: 1,
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
  };

  const cancelButtonStyle = {
    flex: 1,
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Add New Visitor</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>

        <form style={formStyle} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name *"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#3498db"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
          
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            required
            style={selectStyle}
            onFocus={(e) => e.target.style.borderColor = "#3498db"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          >
            <option value="">Select Gender *</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          
          <input
            type="date"
            placeholder="Date of Birth *"
            value={dob}
            onChange={e => setDob(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#3498db"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
          
          <input
            type="tel"
            placeholder="Phone Number *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#3498db"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
          
          <input
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#3498db"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
          
          <input
            type="text"
            placeholder="Address *"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#3498db"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
          
          <div style={buttonGroupStyle}>
            <button
              type="submit"
              style={submitButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#27ae60";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2ecc71";
              }}
            >
              Add Visitor
            </button>
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#7f8c8d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#95a5a6";
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVisitorModal;