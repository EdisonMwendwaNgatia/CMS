import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Attendee, ServiceAttendanceRecord } from "./attendanceTypes";
import type { Member } from "../members/memberTypes";

const SundayServiceAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceName, setServiceName] = useState("Sunday Morning");
  const [location, setLocation] = useState("Main Sanctuary");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingAllMembers, setLoadingAllMembers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const serviceOptions = [
    "Sunday Morning",
    "Sunday Evening",
    "Wednesday Service",
    "Friday Service",
    "Special Service"
  ];

  const locationOptions = [
    "Main Sanctuary",
    "Youth Hall",
    "Children's Church",
    "Outdoor Pavilion",
    "Online/Zoom"
  ];

  useEffect(() => {
    const searchMembers = async () => {
      if (searchTerm.trim().length < 2) {
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
        
        setSearchResults(Array.from(results.values()).slice(0, 10));
      } catch (err) {
        console.error("Error searching members:", err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

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

  const addAllMembers = async () => {
    setLoadingAllMembers(true);
    setError(null);
    
    try {
      const membersRef = collection(db, "members");
      const snapshot = await getDocs(membersRef);
      
      const existingMemberIds = new Set(attendees.map(a => a.memberId));
      const newAttendees: Attendee[] = [];
      
      snapshot.docs.forEach(doc => {
        const member = { id: doc.id, ...doc.data() } as Member;
        
        // Skip if already added
        if (existingMemberIds.has(member.id!)) {
          return;
        }
        
        newAttendees.push({
          memberId: member.id!,
          membershipNumber: member.membershipNumber,
          fullName: member.fullName,
          email: member.email,
          phone: member.phone,
          attended: true,
          checkInTime: new Date().toLocaleTimeString()
        });
      });
      
      setAttendees([...attendees, ...newAttendees]);
      setSuccess(`Successfully added ${newAttendees.length} members to attendance list`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to load all members");
      console.error(err);
    } finally {
      setLoadingAllMembers(false);
    }
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

  const handleSave = async () => {
    if (attendees.length === 0) {
      setError("Please add at least one attendee");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const attendanceData: Omit<ServiceAttendanceRecord, 'id'> = {
        type: "sunday_service",
        serviceDate,
        serviceName,
        location,
        attendees: attendees.filter(a => a.attended),
        totalAttended: attendees.filter(a => a.attended).length,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "serviceAttendance"), attendanceData);
      
      setSuccess("Attendance saved successfully!");
      
      // Reset form
      setTimeout(() => {
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

  const formSectionStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  };

  const formGroupStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
  };

  const labelStyle = {
    fontWeight: "600",
    color: "#7f8c8d",
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const inputStyle = {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1rem",
  };

  const selectStyle = {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1rem",
    background: "white",
  };

  const searchSectionStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const searchHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const searchInputStyle = {
    width: "100%",
    padding: "15px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    marginBottom: "10px",
  };

  const addAllBtnStyle = {
    background: "#9b59b6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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

  const memberInfoStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
  };

  const memberNameStyle = {
    fontWeight: "600",
    color: "#2c3e50",
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

  const statsStyle = {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "5px",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Sunday Service Attendance</h1>
        <button 
          style={backBtnStyle}
          onClick={() => navigate("/dashboard/mark-attendance")}
        >
          ← Back
        </button>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      {/* Service Details Form */}
      <div style={formSectionStyle}>
        <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>Service Details</h2>
        <div style={formGridStyle}>
          <div style={formGroupStyle}>
            <span style={labelStyle}>Service Date</span>
            <input
              type="date"
              style={inputStyle}
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
            />
          </div>
          
          <div style={formGroupStyle}>
            <span style={labelStyle}>Service Name</span>
            <select
              style={selectStyle}
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            >
              {serviceOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div style={formGroupStyle}>
            <span style={labelStyle}>Location</span>
            <select
              style={selectStyle}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locationOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Members */}
      <div style={searchSectionStyle}>
        <div style={searchHeaderStyle}>
          <h2 style={{ color: "#2c3e50", margin: 0 }}>Add Members</h2>
          <button
            style={addAllBtnStyle}
            onClick={addAllMembers}
            disabled={loadingAllMembers}
          >
            {loadingAllMembers ? (
              <>⏳ Loading...</>
            ) : (
              <>
                <span>➕</span> Add All Members
              </>
            )}
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by membership number or name..."
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
                  <div style={memberInfoStyle}>
                    <span style={memberNameStyle}>{member.fullName}</span>
                    <span>
                      <span style={memberBadgeStyle}>
                        {member.membershipNumber}
                      </span>
                    </span>
                  </div>
                  <div style={{ color: "#7f8c8d" }}>
                    {member.email} | {member.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance List */}
      <div style={formSectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#2c3e50", margin: 0 }}>Attendance List</h2>
          <span style={{ background: "#3498db", color: "white", padding: "5px 15px", borderRadius: "20px" }}>
            {attendees.filter(a => a.attended).length} / {attendees.length} Present
          </span>
        </div>

        {attendees.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#7f8c8d",
            background: "#f8f9fa",
            borderRadius: "5px",
          }}>
            <p>No members added yet. Use "Add All Members" or search to add members individually.</p>
          </div>
        ) : (
          <>
            <div style={statsStyle}>
              <div><strong>Total Members:</strong> {attendees.length}</div>
              <div><strong>Present:</strong> {attendees.filter(a => a.attended).length}</div>
              <div><strong>Absent:</strong> {attendees.filter(a => !a.attended).length}</div>
              <div><strong>Attendance Rate:</strong> {Math.round((attendees.filter(a => a.attended).length / attendees.length) * 100)}%</div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Membership No.</th>
                    <th style={tableHeaderStyle}>Name</th>
                    <th style={tableHeaderStyle}>Email</th>
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
                      <td style={tableCellStyle}>{attendee.email}</td>
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
          </>
        )}

        {attendees.length > 0 && (
          <div style={{ marginTop: "30px", textAlign: "right" }}>
            <button
              style={saveBtnStyle}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SundayServiceAttendance;