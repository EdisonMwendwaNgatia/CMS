import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, addDoc, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Attendee, CellGroupAttendanceRecord, CellGroup } from "./attendanceTypes";
import type { Member } from "../members/memberTypes";

const CellGroupAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [selectedCellGroup, setSelectedCellGroup] = useState<CellGroup | null>(null);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Select cell group, Step 2: Mark attendance

  // Load cell groups
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cellGroups"), (snapshot) => {
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CellGroup[];
      setCellGroups(groups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load cell group members when selected
  useEffect(() => {
    if (selectedCellGroup && step === 2) {
      // Load existing members from the cell group
      const loadMembers = async () => {
        try {
          // Get the latest cell group data
          const groupRef = doc(db, "cellGroups", selectedCellGroup.id);
          const groupDoc = await getDoc(groupRef);
          
          if (groupDoc.exists()) {
            const groupData = groupDoc.data() as CellGroup;
            const members = groupData.members || [];
            
            const initialAttendees = members.map(member => ({
              ...member,
              attended: false,
              checkInTime: undefined
            }));
            setAttendees(initialAttendees);
          }
        } catch (err) {
          console.error("Error loading members:", err);
        }
      };
      
      loadMembers();
    } else {
      setAttendees([]);
    }
  }, [selectedCellGroup, step]);

  // Search members for adding to cell group
  useEffect(() => {
    const searchMembers = async () => {
      if (searchTerm.trim().length < 2 || !selectedCellGroup) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const membersRef = collection(db, "members");
        
        // Search by membership number
        const membershipQuery = query(
          membersRef,
          where("membershipNumber", ">=", searchTerm),
          where("membershipNumber", "<=", searchTerm + "\uf8ff")
        );
        
        // Search by name
        const nameQuery = query(
          membersRef,
          where("fullName", ">=", searchTerm),
          where("fullName", "<=", searchTerm + "\uf8ff")
        );
        
        const [membershipSnapshot, nameSnapshot] = await Promise.all([
          getDocs(membershipQuery),
          getDocs(nameQuery)
        ]);
        
        const results = new Map();
        
        membershipSnapshot.docs.forEach(doc => {
          results.set(doc.id, { id: doc.id, ...doc.data() } as Member);
        });
        
        nameSnapshot.docs.forEach(doc => {
          if (!results.has(doc.id)) {
            results.set(doc.id, { id: doc.id, ...doc.data() } as Member);
          }
        });
        
        // Filter out members already in the cell group
        const existingMemberIds = new Set(attendees.map(a => a.memberId));
        const filteredResults = Array.from(results.values())
          .filter(member => !existingMemberIds.has(member.id!))
          .slice(0, 10);
        
        setSearchResults(filteredResults);
      } catch (err) {
        console.error("Error searching members:", err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, attendees, selectedCellGroup]);

  const handleSelectCellGroup = (group: CellGroup) => {
    setSelectedCellGroup(group);
    setStep(2);
  };

  const handleBackToSelection = () => {
    setStep(1);
    setSelectedCellGroup(null);
    setAttendees([]);
  };

  const addAttendee = (member: Member) => {
    // Check if already added
    if (attendees.some(a => a.memberId === member.id)) {
      setError(`${member.fullName} is already in the attendance list`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const newAttendee: Attendee = {
      memberId: member.id!,
      membershipNumber: member.membershipNumber,
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      attended: true,
      checkInTime: new Date().toLocaleTimeString()
    };

    setAttendees([...attendees, newAttendee]);
    setSearchTerm("");
    setSearchResults([]);
    setSuccess(`${member.fullName} added to attendance`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const removeAttendee = (memberId: string) => {
    setAttendees(attendees.filter(a => a.memberId !== memberId));
  };

  const toggleAttendance = (memberId: string) => {
    setAttendees(attendees.map(a => 
      a.memberId === memberId 
        ? { ...a, attended: !a.attended, checkInTime: !a.attended ? new Date().toLocaleTimeString() : undefined }
        : a
    ));
  };

  const handleMarkAllPresent = () => {
    setAttendees(attendees.map(a => ({
      ...a,
      attended: true,
      checkInTime: new Date().toLocaleTimeString()
    })));
  };

  const handleMarkAllAbsent = () => {
    setAttendees(attendees.map(a => ({
      ...a,
      attended: false,
      checkInTime: undefined
    })));
  };

  const handleSave = async () => {
    if (!selectedCellGroup) {
      setError("Please select a cell group");
      return;
    }

    if (attendees.length === 0) {
      setError("No members in this cell group");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const totalAttended = attendees.filter(a => a.attended).length;
      const attendanceRate = Math.round((totalAttended / attendees.length) * 100);

      const attendanceData: Omit<CellGroupAttendanceRecord, 'id'> = {
        type: "cell_group",
        cellGroupId: selectedCellGroup.id,
        cellGroupName: selectedCellGroup.name,
        meetingDate,
        leaderName: selectedCellGroup.leaderName,
        location: selectedCellGroup.location,
        attendees: attendees.filter(a => a.attended),
        totalAttended,
        totalMembers: attendees.length,
        attendanceRate,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "cellGroupAttendance"), attendanceData);
      
      setSuccess("Attendance saved successfully!");
      
      // Reset form
      setTimeout(() => {
        setStep(1);
        setSelectedCellGroup(null);
        setAttendees([]);
        navigate("/dashboard/mark-attendance");
      }, 2000);
    } catch (err) {
      setError("Failed to save attendance");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const containerStyle = {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  };

  const titleStyle = {
    color: "#2c3e50",
    fontSize: "2rem",
    margin: 0,
  };

  const backBtnStyle = {
    background: "none",
    border: "1px solid #ddd",
    color: "#3498db",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  const selectionSectionStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const selectionTitleStyle = {
    color: "#2c3e50",
    fontSize: "1.3rem",
    marginBottom: "20px",
  };

  const cellGroupCardStyle = {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "15px",
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.3s",
  };

  const selectedCardStyle = {
    ...cellGroupCardStyle,
    border: "2px solid #3498db",
    background: "#ebf5fb",
  };

  const sectionStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const formGroupStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
    marginBottom: "20px",
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#7f8c8d",
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const inputStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1rem",
  };

  const searchInputStyle = {
    width: "100%",
    padding: "15px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    marginBottom: "10px",
  };

  const resultsContainerStyle = {
    border: "1px solid #eee",
    borderRadius: "5px",
    maxHeight: "300px",
    overflowY: "auto" as const,
  };

  const resultItemStyle = {
    padding: "15px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const memberBadgeStyle = {
    background: "#3498db",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    display: "inline-block",
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

  const presentBadgeStyle = {
    background: "#2ecc71",
    color: "white",
    padding: "3px 10px",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer" as const,
  };

  const absentBadgeStyle = {
    background: "#e74c3c",
    color: "white",
    padding: "3px 10px",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer" as const,
  };

  const actionBtnStyle = {
    background: "#f39c12",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginRight: "10px",
  };

  const removeBtnStyle = {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
  };

  const saveBtnStyle = {
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "12px 30px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  };

  const errorStyle = {
    background: "#fee",
    color: "#e74c3c",
    padding: "12px 15px",
    borderRadius: "5px",
    marginBottom: "20px",
    borderLeft: "4px solid #e74c3c",
  };

  const successStyle = {
    background: "#d4edda",
    color: "#155724",
    padding: "12px 15px",
    borderRadius: "5px",
    marginBottom: "20px",
    borderLeft: "4px solid #2ecc71",
  };

  const loadingStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "70vh",
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          marginBottom: "20px",
        }}></div>
        <p>Loading cell groups...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={headerStyle}>
        <h1 style={titleStyle}>Cell Group Attendance</h1>
        <div>
          {step === 2 && (
            <button 
              style={{ ...backBtnStyle, marginRight: "10px" }}
              onClick={handleBackToSelection}
            >
              ← Change Group
            </button>
          )}
          <button 
            style={backBtnStyle}
            onClick={() => navigate("/dashboard/mark-attendance")}
          >
            Back to Menu
          </button>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      {/* Step 1: Select Cell Group */}
      {step === 1 && (
        <div style={selectionSectionStyle}>
          <h2 style={selectionTitleStyle}>Select a Cell Group</h2>
          <p style={{ color: "#7f8c8d", marginBottom: "20px" }}>
            Choose a cell group to mark attendance for today's meeting.
          </p>
          
          {cellGroups.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}>
              <p>No cell groups found.</p>
              <button
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  marginTop: "10px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/dashboard/mark-attendance/cell-groups")}
              >
                Create a Cell Group
              </button>
            </div>
          ) : (
            cellGroups.map((group) => (
              <div
                key={group.id}
                style={selectedCellGroup?.id === group.id ? selectedCardStyle : cellGroupCardStyle}
                onClick={() => handleSelectCellGroup(group)}
                onMouseEnter={(e) => {
                  if (selectedCellGroup?.id !== group.id) {
                    e.currentTarget.style.background = "#e8f4fd";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCellGroup?.id !== group.id) {
                    e.currentTarget.style.background = "#f8f9fa";
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ marginBottom: "10px", color: "#2c3e50" }}>{group.name}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                      <div><strong>Leader:</strong> {group.leaderName}</div>
                      <div><strong>Meeting:</strong> {group.meetingDay} at {group.meetingTime}</div>
                      <div><strong>Location:</strong> {group.location}</div>
                      <div><strong>Members:</strong> {group.memberCount}</div>
                    </div>
                  </div>
                  <div style={{
                    background: selectedCellGroup?.id === group.id ? "#3498db" : "#bdc3c7",
                    color: "white",
                    padding: "5px 15px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                  }}>
                    {selectedCellGroup?.id === group.id ? "Selected" : "Select"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Step 2: Mark Attendance */}
      {step === 2 && selectedCellGroup && (
        <>
          {/* Meeting Details */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>{selectedCellGroup.name}</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "20px",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "5px",
            }}>
              <div><strong>Leader:</strong> {selectedCellGroup.leaderName}</div>
              <div><strong>Meeting Day:</strong> {selectedCellGroup.meetingDay}</div>
              <div><strong>Meeting Time:</strong> {selectedCellGroup.meetingTime}</div>
              <div><strong>Location:</strong> {selectedCellGroup.location}</div>
            </div>
            
            <div style={formGroupStyle}>
              <span style={labelStyle}>Meeting Date</span>
              <input
                type="date"
                style={inputStyle}
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
          </div>

          {/* Add Members */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>Add Members</h2>
            <div>
              <input
                type="text"
                placeholder="Search by membership number or name to add new members..."
                style={searchInputStyle}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {searching && <p>Searching...</p>}
              
              {searchResults.length > 0 && (
                <div style={resultsContainerStyle}>
                  {searchResults.map((member) => (
                    <div
                      key={member.id}
                      style={resultItemStyle}
                      onClick={() => addAttendee(member)}
                    >
                      <div>
                        <strong>{member.fullName}</strong>
                        <div>
                          <span style={memberBadgeStyle}>
                            {member.membershipNumber}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: "#7f8c8d" }}>
                        {member.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendance List */}
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#2c3e50", margin: 0 }}>Attendance List</h2>
              <div>
                <button
                  style={actionBtnStyle}
                  onClick={handleMarkAllPresent}
                >
                  ✓ Mark All Present
                </button>
                <button
                  style={{ ...actionBtnStyle, background: "#95a5a6" }}
                  onClick={handleMarkAllAbsent}
                >
                  ✗ Mark All Absent
                </button>
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "20px",
              marginBottom: "20px",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "5px",
            }}>
              <div><strong>Total Members:</strong> {attendees.length}</div>
              <div><strong>Present:</strong> {attendees.filter(a => a.attended).length}</div>
              <div><strong>Absent:</strong> {attendees.filter(a => !a.attended).length}</div>
              <div><strong>Attendance Rate:</strong> {
                attendees.length > 0 
                  ? Math.round((attendees.filter(a => a.attended).length / attendees.length) * 100)
                  : 0
              }%</div>
            </div>

            {attendees.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#7f8c8d",
                background: "#f8f9fa",
                borderRadius: "5px",
              }}>
                <p>No members in this cell group yet.</p>
                <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>
                  Use the search above to add members to this group.
                </p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>Membership No.</th>
                        <th style={tableHeaderStyle}>Name</th>
                        <th style={tableHeaderStyle}>Phone</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Check-in Time</th>
                        <th style={tableHeaderStyle}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees.map((attendee) => (
                        <tr key={attendee.memberId}>
                          <td style={tableCellStyle}>
                            <span style={memberBadgeStyle}>
                              {attendee.membershipNumber}
                            </span>
                          </td>
                          <td style={tableCellStyle}>{attendee.fullName}</td>
                          <td style={tableCellStyle}>{attendee.phone}</td>
                          <td style={tableCellStyle}>
                            <span
                              style={attendee.attended ? presentBadgeStyle : absentBadgeStyle}
                              onClick={() => toggleAttendance(attendee.memberId)}
                            >
                              {attendee.attended ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            {attendee.checkInTime || "-"}
                          </td>
                          <td style={tableCellStyle}>
                            <button
                              style={removeBtnStyle}
                              onClick={() => removeAttendee(attendee.memberId)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: "30px", textAlign: "right" }}>
                  <button
                    style={saveBtnStyle}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Attendance"}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CellGroupAttendance;