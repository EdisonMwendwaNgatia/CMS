import React, { useState, useEffect } from 'react';
import { getFamilyById, unlinkMemberFromFamily } from './familyService';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Family } from './familyTypes';
import type { Member } from '../members/memberTypes';
import LinkMemberModal from './LinkMemberModal';

interface FamilyDetailsProps {
  familyId: string;
  onClose: () => void;
}

interface FamilyMemberWithDetails {
  membershipNumber: string;
  relationship: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: string;
  occupation?: string;
  status?: string;
  age?: number;
}

const calculateAge = (dob: string): number | undefined => {
  if (!dob) return undefined;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const FamilyDetails: React.FC<FamilyDetailsProps> = ({ familyId, onClose }) => {
  const [family, setFamily] = useState<Family | null>(null);
  const [membersWithDetails, setMembersWithDetails] = useState<FamilyMemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    fetchFamilyDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  const fetchFamilyDetails = async () => {
    setLoading(true);
    try {
      // Fetch family data
      const familyData = await getFamilyById(familyId);
      setFamily(familyData || null);
      
      // Fetch member details for each family member
      if (familyData?.members && familyData.members.length > 0) {
        const memberDetailsPromises = familyData.members.map(async (member) => {
          // Query members collection by membershipNumber
          const membersQuery = query(
            collection(db, "members"),
            where("membershipNumber", "==", member.membershipNumber)
          );
          
          const snapshot = await getDocs(membersQuery);
          
          if (!snapshot.empty) {
            const memberData = snapshot.docs[0].data() as Member;
            return {
              membershipNumber: member.membershipNumber,
              relationship: member.relationship,
              fullName: memberData.fullName || 'Unknown',
              email: memberData.email || 'No email',
              phone: memberData.phone || 'No phone',
              gender: memberData.gender || 'Not specified',
              dob: memberData.dob || 'Not specified',
              occupation: memberData.occupation || 'Not specified',
              status: memberData.status || 'inactive',
              age: calculateAge(memberData.dob),
            };
          } else {
            // Member not found in database
            return {
              membershipNumber: member.membershipNumber,
              relationship: member.relationship,
              fullName: 'Member not found',
              email: 'N/A',
              phone: 'N/A',
              age: undefined,
            };
          }
        });
        
        const membersWithDetails = await Promise.all(memberDetailsPromises);
        setMembersWithDetails(membersWithDetails);
      } else {
        setMembersWithDetails([]);
      }
    } catch (error) {
      console.error('Error fetching family details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkMember = async (membershipNumber: string) => {
    if (window.confirm('Remove this member from the family?')) {
      try {
        await unlinkMemberFromFamily(familyId, membershipNumber);
        // Refresh family details
        fetchFamilyDetails();
      } catch (error) {
        console.error('Error unlinking member:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'member':
        return '#2ecc71';
      case 'pre_member':
        return '#f39c12';
      case 'inactive':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '30px',
    width: '90%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  };

  const loadingStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#7f8c8d',
  };

  const spinnerStyle = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{keyframes}</style>
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={loadingStyle}>
              <div style={spinnerStyle}></div>
              <p>Loading family details...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!family) {
    return (
      <div style={modalOverlayStyle}>
        <div style={{ ...modalContentStyle, textAlign: 'center', color: '#e74c3c' }}>
          <h3>Family Not Found</h3>
          <p>The family you're looking for doesn't exist.</p>
          <button 
            onClick={onClose}
            style={{
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{keyframes}</style>
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '25px',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '20px'
          }}>
            <div>
              <h2 style={{ 
                margin: 0, 
                color: '#2c3e50', 
                fontSize: '2rem',
                fontWeight: '600'
              }}>
                {family.familyName}
              </h2>
              <p style={{ 
                margin: '5px 0 0', 
                color: '#7f8c8d', 
                fontSize: '0.9rem',
                fontFamily: 'monospace'
              }}>
                ID: {family.id}
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                color: '#7f8c8d',
                padding: '0 10px',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#2c3e50'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#7f8c8d'}
            >
              ×
            </button>
          </div>

          {/* Family Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px',
            marginBottom: '30px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              borderRadius: '10px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {membersWithDetails.length}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Members</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
              borderRadius: '10px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {membersWithDetails.filter(m => m.status === 'member').length}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Members</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f39c12, #e67e22)',
              borderRadius: '10px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                {membersWithDetails.filter(m => m.status === 'pre_member').length}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pre-members</div>
            </div>
          </div>

          {/* Members List */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#2c3e50', 
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                Family Members
              </h3>
              <button
                onClick={() => setShowLinkModal(true)}
                style={{
                  background: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 5px rgba(46, 204, 113, 0.3)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#27ae60';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2ecc71';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>➕</span> Add Member
              </button>
            </div>

            {membersWithDetails.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '10px',
                color: '#7f8c8d',
                border: '2px dashed #ddd',
              }}>
                <p style={{ margin: 0, fontSize: '1rem' }}>
                  No members in this family yet. Click "Add Member" to link a member.
                </p>
              </div>
            ) : (
              <div style={{ 
                overflowX: 'auto',
                border: '1px solid #eee',
                borderRadius: '10px',
                backgroundColor: 'white',
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  minWidth: '900px',
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#2c3e50', fontWeight: '600' }}>Membership #</th>
                      <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#2c3e50', fontWeight: '600' }}>Full Name</th>
                      <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#2c3e50', fontWeight: '600' }}>Relationship</th>
                      <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#2c3e50', fontWeight: '600' }}>Contact</th>
                      <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#2c3e50', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#2c3e50', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersWithDetails.map((member) => (
                      <tr key={member.membershipNumber} style={{ 
                        borderBottom: '1px solid #eee',
                        transition: 'background 0.3s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'inline-block',
                          }}>
                            {member.membershipNumber}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontWeight: 500, color: '#2c3e50' }}>{member.fullName}</div>
                          {member.gender && member.gender !== 'Not specified' && (
                            <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '4px' }}>
                              {member.gender} • {member.age || ''}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            backgroundColor: '#9b59b6',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            display: 'inline-block',
                          }}>
                            {member.relationship}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ color: '#2c3e50' }}>{member.email}</div>
                          <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '4px' }}>
                            {member.phone}
                          </div>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {member.status && (
                            <span style={{
                              backgroundColor: getStatusColor(member.status),
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              display: 'inline-block',
                            }}>
                              {member.status === 'member' ? 'Member' : 
                               member.status === 'pre_member' ? 'Pre-member' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <button
                            onClick={() => handleUnlinkMember(member.membershipNumber)}
                            style={{
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#c0392b';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#e74c3c';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {family.address && (
            <div style={{ 
              marginTop: '20px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '10px',
              border: '1px solid #eee',
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#2c3e50',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Family Address
              </h4>
              <p style={{ 
                margin: 0, 
                color: '#34495e',
                lineHeight: '1.6'
              }}>
                {family.address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Link Member Modal */}
      {showLinkModal && (
        <LinkMemberModal 
          familyId={familyId} 
          onClose={() => {
            setShowLinkModal(false);
            fetchFamilyDetails();
          }} 
        />
      )}
    </>
  );
};

export default FamilyDetails;