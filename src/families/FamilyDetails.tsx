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
}

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
            };
          } else {
            // Member not found in database
            return {
              membershipNumber: member.membershipNumber,
              relationship: member.relationship,
              fullName: 'Member not found',
              email: 'N/A',
              phone: 'N/A',
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

  if (loading) {
    return (
      <div style={{ 
        border: '1px solid #ccc', 
        padding: 16, 
        marginTop: 16,
        textAlign: 'center',
        color: '#7f8c8d'
      }}>
        Loading family details...
      </div>
    );
  }

  if (!family) {
    return (
      <div style={{ 
        border: '1px solid #ccc', 
        padding: 16, 
        marginTop: 16,
        textAlign: 'center',
        color: '#e74c3c'
      }}>
        Family not found.
      </div>
    );
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      padding: 20, 
      marginTop: 20,
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20,
        borderBottom: '1px solid #eee',
        paddingBottom: 15
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem' }}>
            {family.familyName}
          </h3>
          <p style={{ margin: '5px 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
            Family ID: {family.id}
          </p>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#7f8c8d',
            padding: '0 10px'
          }}
        >
          ×
        </button>
      </div>

      {/* Family Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 15,
        marginBottom: 25,
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3498db' }}>
            {membersWithDetails.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Total Members</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2ecc71' }}>
            {membersWithDetails.filter(m => m.status === 'member').length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Members</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f39c12' }}>
            {membersWithDetails.filter(m => m.status === 'pre_member').length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Pre-members</div>
        </div>
      </div>

      {/* Members List */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 15
        }}>
          <h4 style={{ margin: 0, color: '#2c3e50' }}>Family Members</h4>
          <button
            onClick={() => setShowLinkModal(true)}
            style={{
              background: '#2ecc71',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            + Add Member
          </button>
        </div>

        {membersWithDetails.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 30, 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            color: '#7f8c8d'
          }}>
            No members in this family yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.95rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Membership #</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Full Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Relationship</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Contact</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {membersWithDetails.map((member) => (
                  <tr key={member.membershipNumber} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        padding: '3px 10px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {member.membershipNumber}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 500 }}>{member.fullName}</div>
                      {member.gender && member.gender !== 'Not specified' && (
                        <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{member.gender}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: '#9b59b6',
                        color: 'white',
                        padding: '3px 10px',
                        borderRadius: '15px',
                        fontSize: '0.8rem'
                      }}>
                        {member.relationship}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>{member.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{member.phone}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {member.status && (
                        <span style={{
                          backgroundColor: getStatusColor(member.status),
                          color: 'white',
                          padding: '3px 10px',
                          borderRadius: '15px',
                          fontSize: '0.8rem'
                        }}>
                          {member.status}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleUnlinkMember(member.membershipNumber)}
                        style={{
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
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
          marginTop: 20, 
          padding: 15, 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Family Address</h4>
          <p style={{ margin: 0, color: '#34495e' }}>{family.address}</p>
        </div>
      )}

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
    </div>
  );
};

export default FamilyDetails;