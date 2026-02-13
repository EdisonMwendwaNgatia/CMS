import React, { useState, useEffect } from 'react';
import { addFamily } from './familyService';
import type { Family, FamilyMemberLink } from './familyTypes';
import { getMembers } from '../members/memberService';

interface AddFamilyModalProps {
  onClose: () => void;
}

const AddFamilyModal: React.FC<AddFamilyModalProps> = ({ onClose }) => {
  const [familyName, setFamilyName] = useState('');
  const [address, setAddress] = useState('');
  const [members, setMembers] = useState<FamilyMemberLink[]>([
    { membershipNumber: '', relationship: 'Husband' },
  ]);
  const [allMembershipNumbers, setAllMembershipNumbers] = useState<string[]>([]);
  const [memberErrors, setMemberErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all valid membership numbers when modal opens
    getMembers().then((members) => {
      type MinimalMember = { membershipNumber?: string };
      setAllMembershipNumbers(
        (members as MinimalMember[])
          .map((m) => m.membershipNumber?.toUpperCase() || '')
          .filter(Boolean)
      );
    });
  }, []);

  const handleMemberChange = (idx: number, field: 'membershipNumber' | 'relationship', value: string) => {
    setMembers(members =>
      members.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
    if (field === 'membershipNumber') {
      validateMembershipNumber(idx, value);
    }
  };

  const validateMembershipNumber = (idx: number, value: string) => {
    const val = value.trim().toUpperCase();
    let error = '';
    if (val && !allMembershipNumbers.includes(val)) {
      error = 'Membership number does not exist';
    }
    setMemberErrors((errs) => {
      const newErrs = [...errs];
      newErrs[idx] = error;
      return newErrs;
    });
  };

  const handleAddMember = () => {
    setMembers([...members, { membershipNumber: '', relationship: 'Relative' }]);
    setMemberErrors([...memberErrors, '']);
  };

  const handleRemoveMember = (idx: number) => {
    setMembers(members => members.filter((_, i) => i !== idx));
    setMemberErrors(errs => errs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one member
    const filteredMembers = members.filter(m => m.membershipNumber.trim() !== '');
    if (filteredMembers.length === 0) {
      setError('At least one family member is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newFamily: Omit<Family, 'id'> = {
        familyName,
        members: filteredMembers,
      };
      
      // Add address only if provided
      if (address.trim()) {
        newFamily.address = address.trim();
      }
      
      await addFamily(newFamily);
      onClose();
    } catch (err) {
      console.error('Failed to save family:', err);
      setError('Failed to save family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modalStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  };

  const contentStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '0.95rem',
    boxSizing: 'border-box' as const,
  };

  const errorStyle = {
    color: '#e74c3c',
    fontSize: '0.8rem',
    marginTop: '4px',
  };

  const globalErrorStyle = {
    background: '#fee',
    color: '#e74c3c',
    padding: '12px 15px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #e74c3c',
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '15px'
        }}>
          <h3 style={{ 
            margin: 0, 
            color: '#2c3e50', 
            fontSize: '1.4rem',
            fontWeight: '600'
          }}>
            Add New Family
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.8rem',
              cursor: 'pointer',
              color: '#7f8c8d',
              padding: '0 5px',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#2c3e50'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#7f8c8d'}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={globalErrorStyle}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2c3e50', 
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Family Name *
            </label>
            <input
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
              required
              style={{
                ...inputStyle,
                borderColor: familyName ? '#2ecc71' : '#ddd',
              }}
              placeholder="Enter family name"
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2c3e50', 
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Address (Optional)
            </label>
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={inputStyle}
              placeholder="Enter family address"
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h4 style={{ 
                margin: 0, 
                color: '#2c3e50', 
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Family Members *
              </h4>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={loading}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = '#2980b9';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = '#3498db';
                }}
              >
                + Add Member
              </button>
            </div>

            {members.map((member, idx) => (
              <div key={idx} style={{ 
                marginBottom: '15px',
                padding: '15px',
                border: '1px solid #eee',
                borderRadius: '8px',
                background: '#fafafa'
              }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr auto',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <div>
                    <input
                      placeholder="Membership Number *"
                      value={member.membershipNumber}
                      onChange={e => handleMemberChange(idx, 'membershipNumber', e.target.value)}
                      onBlur={e => validateMembershipNumber(idx, e.target.value)}
                      required
                      disabled={loading}
                      style={{
                        ...inputStyle,
                        borderColor: memberErrors[idx] ? '#e74c3c' : 
                                   member.membershipNumber && !memberErrors[idx] ? '#2ecc71' : '#ddd',
                      }}
                    />
                    {memberErrors[idx] && (
                      <div style={errorStyle}>
                        ⚠️ {memberErrors[idx]}
                      </div>
                    )}
                  </div>
                  
                  <select
                    value={member.relationship}
                    onChange={e => handleMemberChange(idx, 'relationship', e.target.value)}
                    style={inputStyle}
                    disabled={loading}
                  >
                    <option value="Husband">Husband</option>
                    <option value="Wife">Wife</option>
                    <option value="Child">Child</option>
                    <option value="Relative">Relative</option>
                    <option value="Other">Other</option>
                  </select>
                  
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      disabled={loading}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: loading ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.background = '#c0392b';
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.currentTarget.style.background = '#e74c3c';
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            borderTop: '2px solid #f0f0f0',
            paddingTop: '25px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#7f8c8d';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#95a5a6';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={memberErrors.some(e => e) || !familyName || loading}
              style={{
                background: (memberErrors.some(e => e) || !familyName || loading) ? '#bdc3c7' : '#2ecc71',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                cursor: (memberErrors.some(e => e) || !familyName || loading) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: (!memberErrors.some(e => e) && familyName && !loading) ? '0 2px 5px rgba(46, 204, 113, 0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!memberErrors.some(e => e) && familyName && !loading) {
                  e.currentTarget.style.background = '#27ae60';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!memberErrors.some(e => e) && familyName && !loading) {
                  e.currentTarget.style.background = '#2ecc71';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}></span>
                  Creating...
                </span>
              ) : (
                'Create Family'
              )}
            </button>
          </div>

          {/* Helper text */}
          <div style={{ 
            marginTop: '20px', 
            fontSize: '0.8rem', 
            color: '#7f8c8d',
            textAlign: 'center',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '5px',
          }}>
            At least one family member is required. All membership numbers must be valid.
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFamilyModal;