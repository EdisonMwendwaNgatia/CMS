import { useState } from "react";
import { 
  addMember, 
  checkForDuplicateMember, 
  DuplicateMemberError,
  ValidationError,
  validateMemberData
} from "./memberService";
import type { MemberStatus, Member } from "./memberTypes";

export default function AddMemberModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    maritalStatus: "",
    occupation: "",
    profilePhotoUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    show: boolean;
    message: string;
    existingMember?: Partial<Member>;
    duplicateFields: string[];
  }>({ 
    show: false, 
    message: "",
    duplicateFields: [] 
  });

  const modalStyle = {
    background: "white",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "800px",
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

  const errorBoxStyle = {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: "15px 20px",
    marginBottom: "20px",
    borderRadius: "10px",
    color: "#991b1b",
  };

  const errorTitleStyle = {
    fontWeight: "600",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const errorListStyle = {
    margin: "8px 0 0 20px",
    padding: "0",
    color: "#b91c1c",
  };

  const warningBoxStyle = {
    background: "#fffbeb",
    border: "1px solid #fef3c7",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "10px",
    color: "#92400e",
  };

  const existingMemberBoxStyle = {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    margin: "15px 0",
    fontSize: "0.95rem",
    borderLeft: "4px solid #f59e0b",
  };

  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  };

  const fieldGroupStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#4b5563",
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const inputStyle = {
    padding: "12px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  const errorTextStyle = {
    color: "#dc2626",
    fontSize: "0.8rem",
    marginTop: "4px",
  };

  const selectStyle = {
    ...inputStyle,
    background: "white",
    cursor: "pointer",
  };

  const buttonGroupStyle = {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "12px",
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "2px solid #ecf0f1",
  };

  const baseButtonStyle = {
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    transition: "all 0.3s",
    flex: "1 1 auto",
  };

  const duplicateButtonStyle = {
    ...baseButtonStyle,
    background: "#f59e0b",
    color: "white",
  };

  const saveButtonStyle = {
    ...baseButtonStyle,
    background: "#10b981",
    color: "white",
  };

  const cancelButtonStyle = {
    ...baseButtonStyle,
    background: "#6b7280",
    color: "white",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Format phone number as user types
    if (name === "phone") {
      // Remove non-numeric characters except +, -, (, )
      const cleaned = value.replace(/[^\d+\-()\s]/g, '');
      setForm({ ...form, [name]: cleaned });
    } else {
      setForm({ ...form, [name]: value });
    }
    
    // Clear warnings when user edits
    if (duplicateWarning.show) {
      setDuplicateWarning({ show: false, message: "", duplicateFields: [] });
    }
    
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleValidateForm = () => {
    const errors = validateMemberData({
      ...form,
      profilePhotoUrl: form.profilePhotoUrl.trim() || "N/A",
      status: "full_member" as MemberStatus,
      baptism: {},
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleCheckDuplicate = async () => {
    // First validate form
    if (!handleValidateForm()) {
      return;
    }

    setLoading(true);
    try {
      const duplicateCheck = await checkForDuplicateMember({
        ...form,
        profilePhotoUrl: form.profilePhotoUrl.trim() || "N/A",
        status: "full_member" as MemberStatus,
        baptism: {},
      });

      if (duplicateCheck.isDuplicate) {
        const fieldLabels = duplicateCheck.duplicateFields.map(field => {
          switch(field) {
            case 'phone': return 'Phone Number';
            case 'email': return 'Email Address';
            case 'name+dob': return 'Name and Date of Birth';
            default: return field;
          }
        }).join(', ');
        
        setDuplicateWarning({
          show: true,
          message: `Potential duplicate found based on: ${fieldLabels}`,
          existingMember: duplicateCheck.existingMember,
          duplicateFields: duplicateCheck.duplicateFields,
        });
      } else {
        alert("✅ No duplicates found. You can proceed to save.");
      }
    } catch (error) {
      console.error("Error checking duplicate:", error);
      alert("Error checking for duplicates");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate form first
    if (!handleValidateForm()) {
      return;
    }

    setLoading(true);
    try {
      await addMember({
        ...form,
        profilePhotoUrl: form.profilePhotoUrl.trim() || "N/A",
        status: "full_member" as MemberStatus,
        baptism: {},
      });

      onClose();
    } catch (err) {
      console.error(err);
      if (err instanceof DuplicateMemberError) {
        setDuplicateWarning({
          show: true,
          message: err.message,
          duplicateFields: [],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (err instanceof ValidationError) {
        setValidationErrors(err.errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Failed to add member");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForceAdd = async () => {
    setLoading(true);
    try {
      await addMember({
        ...form,
        profilePhotoUrl: form.profilePhotoUrl.trim() || "N/A",
        status: "full_member" as MemberStatus,
        baptism: {},
      }, { 
        skipDuplicateCheck: true,
        skipValidation: false
      });

      onClose();
    } catch (err) {
      console.error(err);
      if (err instanceof ValidationError) {
        setValidationErrors(err.errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Failed to add member");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string => {
    return validationErrors.find(error => 
      error.toLowerCase().includes(fieldName.toLowerCase())
    ) || "";
  };

  return (
    <div style={modalStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Add New Member</h3>
        <button 
          style={closeBtnStyle} 
          onClick={onClose}
          onMouseEnter={(e) => e.currentTarget.style.color = "#4b5563"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#95a5a6"}
        >
          ×
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div style={errorBoxStyle}>
          <div style={errorTitleStyle}>
            <span>⚠️</span>
            <span>Please fix the following errors:</span>
          </div>
          <ul style={errorListStyle}>
            {validationErrors.map((error, index) => (
              <li key={index} style={{ marginBottom: "4px" }}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Duplicate Warning */}
      {duplicateWarning.show && (
        <div style={warningBoxStyle}>
          <div style={{ ...errorTitleStyle, color: "#92400e" }}>
            <span>⚠️</span>
            <span style={{ fontWeight: 600 }}>Potential Duplicate Detected!</span>
          </div>
          <p style={{ margin: "10px 0" }}>{duplicateWarning.message}</p>
          
          {duplicateWarning.existingMember && (
            <div style={existingMemberBoxStyle}>
              <p style={{ margin: "4px 0" }}>
                <strong>Existing Member:</strong> {duplicateWarning.existingMember.fullName}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Phone:</strong> {duplicateWarning.existingMember.phone}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Email:</strong> {duplicateWarning.existingMember.email}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Membership #:</strong> {duplicateWarning.existingMember.membershipNumber}
              </p>
            </div>
          )}
          
          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button 
              onClick={handleForceAdd}
              disabled={loading}
              style={duplicateButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "#d97706"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f59e0b"}
            >
              {loading ? 'Adding...' : 'Add Anyway (Override)'}
            </button>
            <button 
              onClick={() => setDuplicateWarning({ 
                show: false, 
                message: "", 
                duplicateFields: [] 
              })}
              style={cancelButtonStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = "#4b5563"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#6b7280"}
            >
              Review Details
            </button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div style={formGridStyle}>
        <div style={fieldGroupStyle}>
          <label htmlFor="fullName" style={labelStyle}>Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={form.fullName}
            onChange={handleChange}
            required
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
          {getFieldError('full name') && (
            <small style={errorTextStyle}>{getFieldError('full name')}</small>
          )}
        </div>

        <div style={fieldGroupStyle}>
          <label htmlFor="gender" style={labelStyle}>Gender *</label>
          <select 
            id="gender"
            name="gender" 
            value={form.gender} 
            onChange={handleChange} 
            required
            style={selectStyle}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {getFieldError('gender') && (
            <small style={errorTextStyle}>{getFieldError('gender')}</small>
          )}
        </div>

        <div style={fieldGroupStyle}>
          <label htmlFor="dob" style={labelStyle}>Date of Birth *</label>
          <input 
            type="date" 
            id="dob"
            name="dob" 
            value={form.dob} 
            onChange={handleChange} 
            required
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
          {getFieldError('date of birth') && (
            <small style={errorTextStyle}>{getFieldError('date of birth')}</small>
          )}
        </div>
        
        <div style={fieldGroupStyle}>
          <label htmlFor="phone" style={labelStyle}>Phone Number *</label>
          <input 
            id="phone"
            name="phone" 
            placeholder="+1234567890" 
            value={form.phone} 
            onChange={handleChange} 
            required
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
          {getFieldError('phone') && (
            <small style={errorTextStyle}>{getFieldError('phone')}</small>
          )}
        </div>
        
        <div style={fieldGroupStyle}>
          <label htmlFor="email" style={labelStyle}>Email Address *</label>
          <input 
            id="email"
            name="email" 
            placeholder="john@example.com" 
            value={form.email} 
            onChange={handleChange} 
            required
            type="email"
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
          {getFieldError('email') && (
            <small style={errorTextStyle}>{getFieldError('email')}</small>
          )}
        </div>
        
        <div style={fieldGroupStyle}>
          <label htmlFor="address" style={labelStyle}>Physical Address</label>
          <input 
            id="address"
            name="address" 
            placeholder="123 Main St, City, Country" 
            value={form.address} 
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
        
        <div style={fieldGroupStyle}>
          <label htmlFor="maritalStatus" style={labelStyle}>Marital Status</label>
          <select
            id="maritalStatus"
            name="maritalStatus" 
            value={form.maritalStatus} 
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
        </div>
        
        <div style={fieldGroupStyle}>
          <label htmlFor="occupation" style={labelStyle}>Occupation</label>
          <input 
            id="occupation"
            name="occupation" 
            placeholder="Software Developer" 
            value={form.occupation} 
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

        <div style={{ ...fieldGroupStyle, gridColumn: "1 / -1" }}>
          <label htmlFor="profilePhotoUrl" style={labelStyle}>Profile Photo URL</label>
          <input
            id="profilePhotoUrl"
            name="profilePhotoUrl"
            placeholder="https://example.com/photo.jpg"
            value={form.profilePhotoUrl}
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
      </div>

      {/* Action Buttons */}
      <div style={buttonGroupStyle}>
        <button 
          onClick={handleCheckDuplicate}
          disabled={loading || (!form.phone && !form.email)}
          style={{
            ...duplicateButtonStyle,
            opacity: loading || (!form.phone && !form.email) ? 0.6 : 1,
            cursor: loading || (!form.phone && !form.email) ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!loading && (form.phone || form.email)) {
              e.currentTarget.style.background = "#d97706";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && (form.phone || form.email)) {
              e.currentTarget.style.background = "#f59e0b";
            }
          }}
        >
          {loading ? "Checking..." : "Check for Duplicates"}
        </button>
        
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          style={{
            ...saveButtonStyle,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#059669";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = "#10b981";
          }}
        >
          {loading ? "Saving..." : "Save Member"}
        </button>

        <button 
          onClick={onClose}
          style={cancelButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = "#4b5563"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#6b7280"}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}