import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, arrayUnion, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Ministry, MinistryMember } from "./ministryTypes";
import type { Member } from "../members/memberTypes";
import AttendanceModal from "./AttendanceModal";
import { 
  subscribeToMinistryAttendance, 
  deleteAttendanceSession 
} from "./ministryAttendanceService";
import type { MinistryAttendance } from "./ministryAttendanceTypes";

const MinistryDetails: React.FC = () => {
  const { ministryId } = useParams<{ ministryId: string }>();
  const navigate = useNavigate();
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [members, setMembers] = useState<MinistryMember[]>([]);
  const [membershipNumber, setMembershipNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Attendance states
  const [attendanceRecords, setAttendanceRecords] = useState<MinistryAttendance[]>([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<MinistryAttendance | null>(null);
  const [memberStats, setMemberStats] = useState<Record<string, { attended: number, total: number, rate: number }>>({});
  // Used to force refresh after attendance
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  useEffect(() => {
    if (!ministryId) return;

    const ministryRef = doc(db, "ministries", ministryId);
    
    const unsubscribe = onSnapshot(ministryRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Ministry;
        setMinistry({
          ...data,
          id: doc.id,
          members: data.members || []
        });
        setMembers(data.members || []);
      } else {
        setError("Ministry not found");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ministryId]);

  // Subscribe to attendance records
  useEffect(() => {
    if (!ministryId) return;
    const unsubscribe = subscribeToMinistryAttendance(ministryId, (records) => {
      setAttendanceRecords(records);
      // Calculate stats for each member
      const stats: Record<string, { attended: number, total: number, rate: number }> = {};
      records.forEach(record => {
        record.attendees.forEach(attendee => {
          if (!stats[attendee.memberId]) {
            stats[attendee.memberId] = { attended: 0, total: 0, rate: 0 };
          }
          stats[attendee.memberId].total++;
          if (attendee.attended) {
            stats[attendee.memberId].attended++;
          }
        });
      });
      // Calculate rates
      Object.keys(stats).forEach(memberId => {
        const member = stats[memberId];
        member.rate = Math.round((member.attended / member.total) * 100);
      });
      setMemberStats(stats);
    });
    return () => unsubscribe();
  }, [ministryId, attendanceRefreshKey]);

  const searchMember = async () => {
    if (!membershipNumber.trim()) {
      setError("Please enter a membership number");
      return;
    }

    setSearching(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if member is already in this ministry
      const isAlreadyMember = members.some(
        member => member.membershipNumber === membershipNumber
      );

      if (isAlreadyMember) {
        setError("This member is already part of this ministry");
        return;
      }

      // Search for member in members collection
      const membersQuery = query(
        collection(db, "members"),
        where("membershipNumber", "==", membershipNumber)
      );

      const snapshot = await getDocs(membersQuery);
      
      if (snapshot.empty) {
        setError("Member not found with this membership number");
        return;
      }

      const memberData = snapshot.docs[0].data() as Pick<Member, "membershipNumber" | "fullName" | "email" | "phone">;
      
      // Show confirmation
      const confirmAdd = window.confirm(
        `Add ${memberData.fullName} (${membershipNumber}) to this ministry?`
      );

      if (confirmAdd) {
        await addMemberToMinistry(memberData, snapshot.docs[0].id);
      }
    } catch (err) {
      setError("Error searching for member");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const addMemberToMinistry = async (
    memberData: Pick<Member, "membershipNumber" | "fullName" | "email" | "phone">,
    memberId: string
  ) => {
    setAdding(true);
    setError(null);

    try {
      const ministryRef = doc(db, "ministries", ministryId!);
      const memberToAdd: MinistryMember = {
        memberId,
        membershipNumber: memberData.membershipNumber,
        fullName: memberData.fullName,
        email: memberData.email,
        phone: memberData.phone,
        joinedAt: new Date().toISOString()
      };

      // Add to ministry members array
      await updateDoc(ministryRef, {
        members: arrayUnion(memberToAdd),
        memberCount: (ministry?.memberCount || 0) + 1
      });

      // Also add ministryId to member document
      const memberRef = doc(db, "members", memberId);
      await updateDoc(memberRef, {
        ministries: arrayUnion(ministryId)
      });

      setMembershipNumber("");
      setSuccess(`${memberData.fullName} has been added to the ministry`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to add member to ministry");
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const removeMember = async (member: MinistryMember) => {
    if (!window.confirm(`Remove ${member.fullName} from this ministry?`)) return;

    try {
      const ministryRef = doc(db, "ministries", ministryId!);
      
      // Remove from ministry members array
      await updateDoc(ministryRef, {
        members: members.filter(m => m.memberId !== member.memberId),
        memberCount: (ministry?.memberCount || 0) - 1
      });

      // Remove ministryId from member document
      const memberRef = doc(db, "members", member.memberId);
      const memberDoc = await getDocs(query(collection(db, "members"), where("id", "==", member.memberId)));
      
      if (!memberDoc.empty) {
        const memberData = memberDoc.docs[0].data();
        const ministries = memberData.ministries || [];
        const updatedMinistries = ministries.filter((id: string) => id !== ministryId);
        
        await updateDoc(memberRef, {
          ministries: updatedMinistries
        });
      }
    } catch (err) {
      setError("Failed to remove member");
      console.error(err);
    }
  };

  const handleTakeAttendance = () => {
    setSelectedAttendance(null);
    setIsAttendanceModalOpen(true);
  };

  const handleEditAttendance = (attendance: MinistryAttendance) => {
    setSelectedAttendance(attendance);
    setIsAttendanceModalOpen(true);
  };

  const handleDeleteAttendance = async (attendanceId: string, meetingDate: string) => {
    if (window.confirm(`Delete attendance record for ${meetingDate}?`)) {
      try {
        await deleteAttendanceSession(attendanceId);
      } catch (err) {
        setError("Failed to delete attendance record");
        console.error(err);
      }
    }
  };

  const containerStyle = {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const backButtonStyle = {
    marginBottom: "20px",
  };

  const backBtnStyle = {
    background: "none",
    border: "1px solid #ddd",
    color: "#3498db",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.3s",
  };

  const headerStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle = {
    color: "#2c3e50",
    marginBottom: "10px",
    fontSize: "2.2rem",
  };

  const descriptionStyle = {
    color: "#7f8c8d",
    fontSize: "1.1rem",
    lineHeight: "1.6",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #eee",
  };

  const metaGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  };

  const metaItemStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
  };

  const metaLabelStyle = {
    fontWeight: "600",
    color: "#7f8c8d",
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const metaValueStyle = {
    color: "#2c3e50",
    fontSize: "1.1rem",
  };

  const sectionStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const sectionTitleStyle = {
    color: "#2c3e50",
    marginBottom: "20px",
    fontSize: "1.5rem",
  };

  const formStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  };

  const inputStyle = {
    flex: "1",
    padding: "12px 15px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1rem",
  };

  const searchBtnStyle = {
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background 0.3s",
    whiteSpace: "nowrap" as const,
  };

  const errorStyle = {
    background: "#fee",
    color: "#e74c3c",
    padding: "12px 15px",
    borderRadius: "5px",
    marginTop: "10px",
    borderLeft: "4px solid #e74c3c",
  };

  const successStyle = {
    background: "#d4edda",
    color: "#155724",
    padding: "12px 15px",
    borderRadius: "5px",
    marginTop: "10px",
    borderLeft: "4px solid #2ecc71",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse" as const,
  };

  const tableHeaderStyle = {
    background: "#f8f9fa",
    textAlign: "left" as const,
    padding: "15px",
    color: "#2c3e50",
    fontWeight: "600",
    borderBottom: "2px solid #eee",
  };

  const tableCellStyle = {
    padding: "15px",
    borderBottom: "1px solid #eee",
    color: "#34495e",
  };

  const removeBtnStyle = {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    transition: "background 0.3s",
  };

  const editBtnStyle = {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    marginRight: "5px",
    transition: "background 0.3s",
  };

  const loadingStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "70vh",
  };

  const spinnerStyle = {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
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
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <p>Loading ministry details...</p>
        </div>
      </>
    );
  }

  if (!ministry) {
    return (
      <div style={containerStyle}>
        <div style={backButtonStyle}>
          <button 
            style={backBtnStyle}
            onClick={() => navigate("/dashboard/ministries")}
          >
            ← Back to Ministries
          </button>
        </div>
        <div style={{...sectionStyle, textAlign: "center"}}>
          <h2>Ministry Not Found</h2>
          <p>The ministry you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      
      <div style={backButtonStyle}>
        <button 
          style={backBtnStyle}
          onClick={() => navigate("/dashboard/ministries")}
        >
          ← Back to Ministries
        </button>
      </div>

      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>{ministry.name}</h1>
          <p style={descriptionStyle}>{ministry.description}</p>
          
          <div style={metaGridStyle}>
            <div style={metaItemStyle}>
              <span style={metaLabelStyle}>Leader:</span>
              <span style={metaValueStyle}>{ministry.leaderName}</span>
            </div>
            <div style={metaItemStyle}>
              <span style={metaLabelStyle}>Email:</span>
              <span style={metaValueStyle}>{ministry.leaderEmail}</span>
            </div>
            <div style={metaItemStyle}>
              <span style={metaLabelStyle}>Meeting:</span>
              <span style={metaValueStyle}>
                {ministry.meetingDay} at {ministry.meetingTime}, {ministry.meetingLocation}
              </span>
            </div>
            <div style={metaItemStyle}>
              <span style={metaLabelStyle}>Members:</span>
              <span style={metaValueStyle}>{ministry.memberCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Add Member to Ministry</h2>
        <div style={formStyle}>
          <input
            type="text"
            placeholder="Enter Membership Number (e.g., CH-2026-0001)"
            value={membershipNumber}
            onChange={(e) => setMembershipNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMember()}
            style={inputStyle}
          />
          <button 
            onClick={searchMember} 
            disabled={searching || adding}
            style={{
              ...searchBtnStyle,
              ...(searching || adding ? { background: "#95a5a6", cursor: "not-allowed" } : {})
            }}
          >
            {searching ? "Searching..." : "Search & Add"}
          </button>
        </div>
        
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
      </div>

      {/* Attendance Section */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={sectionTitleStyle}>Attendance</h2>
          <button
            onClick={handleTakeAttendance}
            style={{
              background: members.length === 0 ? "#95a5a6" : "#2ecc71",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: members.length === 0 ? "not-allowed" : "pointer",
              fontSize: "1rem",
            }}
            disabled={members.length === 0}
          >
            Take Attendance
          </button>
        </div>
        
        {attendanceRecords.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#7f8c8d",
            background: "#f8f9fa",
            borderRadius: "5px",
          }}>
            <p>No attendance records yet. Click "Take Attendance" to start.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Date</th>
                  <th style={tableHeaderStyle}>Day</th>
                  <th style={tableHeaderStyle}>Present</th>
                  <th style={tableHeaderStyle}>Total</th>
                  <th style={tableHeaderStyle}>Rate</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tableCellStyle}>
                      {new Date(record.meetingDate).toLocaleDateString()}
                    </td>
                    <td style={tableCellStyle}>{record.meetingDay}</td>
                    <td style={tableCellStyle}>{record.totalAttended}</td>
                    <td style={tableCellStyle}>{record.totalMembers}</td>
                    <td style={tableCellStyle}>
                      <span style={{
                        background: record.attendanceRate >= 70 ? "#2ecc71" : 
                                   record.attendanceRate >= 50 ? "#f39c12" : "#e74c3c",
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                      }}>
                        {record.attendanceRate}%
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => handleEditAttendance(record)}
                        style={editBtnStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAttendance(record.id!, record.meetingDate)}
                        style={removeBtnStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Members List */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Ministry Members ({members.length})</h2>
        
        {members.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#7f8c8d",
            background: "#f8f9fa",
            borderRadius: "5px",
          }}>
            <p>No members yet. Add members using their membership numbers.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Membership No.</th>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Phone</th>
                  <th style={tableHeaderStyle}>Attendance Rate</th>
                  <th style={tableHeaderStyle}>Joined On</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.memberId} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tableCellStyle}>
                      <span style={{
                        background: "#3498db",
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                      }}>
                        {member.membershipNumber}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{member.fullName}</td>
                    <td style={tableCellStyle}>{member.email}</td>
                    <td style={tableCellStyle}>{member.phone}</td>
                    <td style={tableCellStyle}>
                      {memberStats[member.memberId] ? (
                        <span style={{
                          background: memberStats[member.memberId].rate >= 70 ? "#2ecc71" : 
                                     memberStats[member.memberId].rate >= 50 ? "#f39c12" : "#e74c3c",
                          color: "white",
                          padding: "3px 10px",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                        }}>
                          {memberStats[member.memberId].rate}% 
                          ({memberStats[member.memberId].attended}/{memberStats[member.memberId].total})
                        </span>
                      ) : (
                        <span style={{ color: "#7f8c8d" }}>No data</span>
                      )}
                    </td>
                    <td style={tableCellStyle}>{new Date(member.joinedAt).toLocaleDateString()}</td>
                    <td style={tableCellStyle}>
                      <button
                        style={removeBtnStyle}
                        onClick={() => removeMember(member)}
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

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setSelectedAttendance(null);
        }}
        ministryId={ministryId!}
        ministryName={ministry.name}
        meetingDay={ministry.meetingDay}
        members={members}
        existingAttendance={selectedAttendance}
        onSuccess={() => {
          // Force refresh attendance data
          setAttendanceRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};

export default MinistryDetails;