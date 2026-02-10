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
        skipValidation: false // Still validate even when forcing add
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
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>Add New Member</h3>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="validation-errors" style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            padding: '10px 15px',
            marginBottom: '15px',
            borderRadius: '4px',
            color: '#721c24'
          }}>
            <strong>⚠️ Please fix the following errors:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicateWarning.show && (
          <div className="duplicate-warning" style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '4px',
            color: '#856404'
          }}>
            <strong>⚠️ Potential Duplicate Detected!</strong>
            <p style={{ margin: '8px 0' }}>{duplicateWarning.message}</p>
            
            {duplicateWarning.existingMember && (
              <div style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                margin: '10px 0',
                fontSize: '14px'
              }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Existing Member:</strong> {duplicateWarning.existingMember.fullName}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Phone:</strong> {duplicateWarning.existingMember.phone}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Email:</strong> {duplicateWarning.existingMember.email}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Membership #:</strong> {duplicateWarning.existingMember.membershipNumber}
                </p>
              </div>
            )}
            
            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={handleForceAdd}
                disabled={loading}
                style={{ 
                  background: '#dc3545',
                  color: 'white',
                  marginRight: '10px',
                  padding: '8px 16px'
                }}
              >
                {loading ? 'Adding...' : 'Add Anyway (Override)'}
              </button>
              <button 
                onClick={() => setDuplicateWarning({ 
                  show: false, 
                  message: "", 
                  duplicateFields: [] 
                })}
                style={{ 
                  background: '#6c757d',
                  color: 'white',
                  padding: '8px 16px'
                }}
              >
                Review Details
              </button>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="form-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
            {getFieldError('full name') && (
              <small style={{ color: '#dc3545' }}>{getFieldError('full name')}</small>
            )}
          </div>

          <div>
            <label htmlFor="gender">Gender *</label>
            <select 
              id="gender"
              name="gender" 
              value={form.gender} 
              onChange={handleChange} 
              required
              style={{ width: '100%' }}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {getFieldError('gender') && (
              <small style={{ color: '#dc3545' }}>{getFieldError('gender')}</small>
            )}
          </div>

          <div>
            <label htmlFor="dob">Date of Birth *</label>
            <input 
              type="date" 
              id="dob"
              name="dob" 
              value={form.dob} 
              onChange={handleChange} 
              required
              style={{ width: '100%' }}
            />
            {getFieldError('date of birth') && (
              <small style={{ color: '#dc3545' }}>{getFieldError('date of birth')}</small>
            )}
          </div>
          
          <div>
            <label htmlFor="phone">Phone Number *</label>
            <input 
              id="phone"
              name="phone" 
              placeholder="+1234567890" 
              value={form.phone} 
              onChange={handleChange} 
              required
              style={{ width: '100%' }}
            />
            {getFieldError('phone') && (
              <small style={{ color: '#dc3545' }}>{getFieldError('phone')}</small>
            )}
          </div>
          
          <div>
            <label htmlFor="email">Email Address *</label>
            <input 
              id="email"
              name="email" 
              placeholder="john@example.com" 
              value={form.email} 
              onChange={handleChange} 
              required
              type="email"
              style={{ width: '100%' }}
            />
            {getFieldError('email') && (
              <small style={{ color: '#dc3545' }}>{getFieldError('email')}</small>
            )}
          </div>
          
          <div>
            <label htmlFor="address">Physical Address</label>
            <input 
              id="address"
              name="address" 
              placeholder="123 Main St, City, Country" 
              value={form.address} 
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label htmlFor="maritalStatus">Marital Status</label>
            <select
              id="maritalStatus"
              name="maritalStatus" 
              value={form.maritalStatus} 
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="occupation">Occupation</label>
            <input 
              id="occupation"
              name="occupation" 
              placeholder="Software Developer" 
              value={form.occupation} 
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="profilePhotoUrl">Profile Photo URL</label>
            <input
              id="profilePhotoUrl"
              name="profilePhotoUrl"
              placeholder="https://example.com/photo.jpg"
              value={form.profilePhotoUrl}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '10px', 
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid #dee2e6'
        }}>
          <button 
            onClick={handleCheckDuplicate}
            disabled={loading || (!form.phone && !form.email)}
            style={{ 
              background: '#17a2b8', 
              color: 'white',
              padding: '10px 20px',
              flex: 1
            }}
          >
            {loading ? "Checking..." : "Check for Duplicates"}
          </button>
          
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            style={{ 
              background: '#28a745', 
              color: 'white',
              padding: '10px 20px',
              flex: 2
            }}
          >
            {loading ? "Saving..." : "Save Member"}
          </button>

          <button 
            onClick={onClose} 
            style={{ 
              background: '#6c757d', 
              color: 'white',
              padding: '10px 20px',
              flex: 1
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
