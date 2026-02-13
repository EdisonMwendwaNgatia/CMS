import React, { useState, useEffect } from 'react';
import { linkMemberToFamily } from './familyService';
import { getMembers } from '../members/memberService';
import type { Family } from './familyTypes';

interface LinkMemberModalProps {
  familyId: string;
  onClose: () => void;
}

const LinkMemberModal: React.FC<LinkMemberModalProps> = ({ familyId, onClose }) => {
  const [membershipNumber, setMembershipNumber] = useState('');
  const [relationship, setRelationship] = useState<Family['members'][number]['relationship']>('Other');
  const [allMembershipNumbers, setAllMembershipNumbers] = useState<string[]>([]);
  const [memberError, setMemberError] = useState<string>('');
  const [isValidMember, setIsValidMember] = useState(false);
  const [memberName, setMemberName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // Fetch all valid membership numbers when modal opens
    getMembers().then((members) => {
      type MinimalMember = { membershipNumber?: string; fullName?: string };
      const memberData = members as MinimalMember[];
      setAllMembershipNumbers(
        memberData.map((m) => m.membershipNumber?.toUpperCase() || '').filter(Boolean)
      );
    });
  }, []);

  const validateMembershipNumber = (value: string) => {
    const val = value.trim().toUpperCase();
    let error = '';
    let valid = false;

    if (!val) {
      error = 'Membership number is required';
    } else if (!allMembershipNumbers.includes(val)) {
      error = 'Membership number does not exist in the database';
    } else {
      valid = true;
      // Find member name for display
      getMembers().then((members) => {
        type MinimalMember = { membershipNumber?: string; fullName?: string };
        const memberData = members as MinimalMember[];
        const member = memberData.find(m => 
          (m.membershipNumber?.toUpperCase() || '') === val
        );
        if (member) {
          setMemberName(member.fullName || '');
        }
      });
    }

    setMemberError(error);
    setIsValidMember(valid);
    return valid;
  };

  const handleMembershipNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMembershipNumber(value);
    setTouched(true);
    
    // Clear error while typing
    if (memberError) {
      setMemberError('');
      setIsValidMember(false);
      setMemberName('');
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validateMembershipNumber(membershipNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    const isValid = validateMembershipNumber(membershipNumber);
    
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      await linkMemberToFamily(familyId, membershipNumber.trim().toUpperCase(), relationship);
      onClose();
    } catch (error) {
      console.error('Error linking member:', error);
      setMemberError('Failed to link member. Please try again.');
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
    zIndex: 1200,
  };

  const contentStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: `2px solid ${memberError ? '#e74c3c' : isValidMember ? '#2ecc71' : '#ddd'}`,
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={modalStyle}>
      <style>{keyframes}</style>
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
            Link Member to Family
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2c3e50', 
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Membership Number *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                value={membershipNumber}
                onChange={handleMembershipNumberChange}
                onBlur={handleBlur}
                required
                style={inputStyle}
                placeholder="Enter membership number (e.g., CH-2026-0001)"
                disabled={loading}
              />
              {isValidMember && memberName && (
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#2ecc71',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  background: 'white',
                  padding: '0 5px',
                }}>
                  ✓ Valid
                </div>
              )}
            </div>
            
            {/* Validation Messages */}
            {touched && membershipNumber && !memberError && !isValidMember && (
              <div style={{ 
                color: '#f39c12', 
                fontSize: '0.85rem', 
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                background: '#fef5e7',
                borderRadius: '5px',
              }}>
                <span>⏳</span> Checking membership number...
              </div>
            )}
            
            {memberError && (
              <div style={{ 
                color: '#e74c3c', 
                fontSize: '0.85rem', 
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                background: '#fdeded',
                borderRadius: '5px',
              }}>
                <span>⚠️</span> {memberError}
              </div>
            )}
            
            {isValidMember && memberName && (
              <div style={{ 
                color: '#27ae60', 
                fontSize: '0.95rem', 
                marginTop: '12px',
                padding: '12px 15px',
                background: '#d4edda',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #c3e6cb',
              }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                <div>
                  <strong style={{ display: 'block', marginBottom: '3px' }}>Member Found:</strong>
                  <span>{memberName}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2c3e50', 
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Relationship *
            </label>
            <select
              value={relationship}
              onChange={e => setRelationship(e.target.value as Family['members'][number]['relationship'])}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3498db'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              disabled={loading}
            >
              <option value="Husband">Husband</option>
              <option value="Wife">Wife</option>
              <option value="Child">Child</option>
              <option value="Relative">Relative</option>
              <option value="Other">Other</option>
            </select>
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
                if (!loading) {
                  e.currentTarget.style.background = '#7f8c8d';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#95a5a6';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidMember || loading}
              style={{
                background: isValidMember ? '#2ecc71' : '#bdc3c7',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                cursor: (isValidMember && !loading) ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s',
                boxShadow: isValidMember ? '0 2px 5px rgba(46, 204, 113, 0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (isValidMember && !loading) {
                  e.currentTarget.style.background = '#27ae60';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (isValidMember && !loading) {
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
                  Linking...
                </span>
              ) : (
                'Link Member'
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
            Enter a valid membership number to link a member to this family.
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkMemberModal;