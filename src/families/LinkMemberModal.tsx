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
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  };

  const contentStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: `2px solid ${memberError ? '#e74c3c' : isValidMember ? '#2ecc71' : '#ddd'}`,
    borderRadius: '5px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    outline: 'none',
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>Link Member to Family</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#7f8c8d',
              padding: '0 5px'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2c3e50', 
              fontWeight: 600,
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
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  background: 'white',
                  padding: '0 5px'
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
                marginTop: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span>⏳</span> Checking membership number...
              </div>
            )}
            
            {memberError && (
              <div style={{ 
                color: '#e74c3c', 
                fontSize: '0.85rem', 
                marginTop: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span>⚠️</span> {memberError}
              </div>
            )}
            
            {isValidMember && memberName && (
              <div style={{ 
                color: '#2ecc71', 
                fontSize: '0.95rem', 
                marginTop: '8px',
                padding: '10px',
                background: '#d4edda',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✅</span>
                <div>
                  <strong>Member Found:</strong> {memberName}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2c3e50', 
              fontWeight: 600,
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
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1rem',
                background: 'white',
                cursor: 'pointer',
              }}
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
            gap: '10px', 
            justifyContent: 'flex-end',
            borderTop: '1px solid #eee',
            paddingTop: '20px'
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
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
                opacity: loading ? 0.7 : 1,
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
                padding: '12px 24px',
                borderRadius: '5px',
                cursor: (isValidMember && !loading) ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.3s',
              }}
            >
              {loading ? 'Linking...' : 'Link Member'}
            </button>
          </div>

          {/* Helper text */}
          <div style={{ 
            marginTop: '15px', 
            fontSize: '0.8rem', 
            color: '#7f8c8d',
            textAlign: 'center'
          }}>
            Enter a valid membership number to link a member to this family.
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkMemberModal;