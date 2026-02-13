import React, { useState, useEffect } from "react";
import type { MinistryMember } from "./ministryTypes";
import type { MinistryAttendance, MinistryAttendee } from "./ministryAttendanceTypes";
import { createAttendanceSession, updateAttendanceSession } from "./ministryAttendanceService";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ministryId: string;
  ministryName: string;
  meetingDay: string;
  members: MinistryMember[];
  existingAttendance?: MinistryAttendance | null;
  onSuccess?: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  ministryId,
  ministryName,
  meetingDay,
  members,
  existingAttendance = null,
  onSuccess
}) => {
  const [meetingDate, setMeetingDate] = useState(
    existingAttendance?.meetingDate || new Date().toISOString().split('T')[0]
  );
  const [attendees, setAttendees] = useState<MinistryAttendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (existingAttendance) {
      setAttendees(existingAttendance.attendees);
      setMeetingDate(existingAttendance.meetingDate);
    } else {
      // Initialize attendees from ministry members
      const initialAttendees: MinistryAttendee[] = members.map(member => ({
        memberId: member.memberId,
        membershipNumber: member.membershipNumber,
        fullName: member.fullName,
        attended: false,
        checkInTime: undefined
      }));
      setAttendees(initialAttendees);
    }
  }, [members, existingAttendance]);

  useEffect(() => {
    // Check if all attendees are checked
    if (attendees.length > 0) {
      const allChecked = attendees.every(a => a.attended);
      setSelectAll(allChecked);
    }
  }, [attendees]);

  const handleToggleAttendee = (memberId: string) => {
    setAttendees(prev => prev.map(attendee => 
      attendee.memberId === memberId 
        ? { 
            ...attendee, 
            attended: !attendee.attended,
            checkInTime: !attendee.attended ? new Date().toLocaleTimeString() : undefined
          } 
        : attendee
    ));
  };

  const handleToggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setAttendees(prev => prev.map(attendee => ({
      ...attendee,
      attended: newSelectAll,
      checkInTime: newSelectAll ? new Date().toLocaleTimeString() : undefined
    })));
  };

  const handleMarkAllPresent = () => {
    setAttendees(prev => prev.map(attendee => ({
      ...attendee,
      attended: true,
      checkInTime: new Date().toLocaleTimeString()
    })));
    setSelectAll(true);
  };

  const handleMarkAllAbsent = () => {
    setAttendees(prev => prev.map(attendee => ({
      ...attendee,
      attended: false,
      checkInTime: undefined
    })));
    setSelectAll(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (existingAttendance?.id) {
        // Update existing attendance
        await updateAttendanceSession(existingAttendance.id, attendees);
      } else {
        // Create new attendance
        await createAttendanceSession({
          ministryId,
          ministryName,
          meetingDate,
          meetingDay,
          attendees,
          totalMembers: members.length,
        });
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  const totalAttended = attendees.filter(a => a.attended).length;
  const attendanceRate = members.length > 0 
    ? Math.round((totalAttended / members.length) * 100) 
    : 0;

  if (!isOpen) return null;

  const modalStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const contentStyle = {
    background: "white",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflow: "auto",
    padding: "25px",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const titleStyle = {
    color: "#2c3e50",
    fontSize: "1.5rem",
    margin: 0,
  };

  const closeBtnStyle = {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#7f8c8d",
  };

  const statsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
  };

  const statItemStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
  };

  const statValueStyle = {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#3498db",
  };

  const statLabelStyle = {
    fontSize: "0.9rem",
    color: "#7f8c8d",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "20px",
  };

  const thStyle = {
    background: "#f8f9fa",
    padding: "12px",
    textAlign: "left" as const,
    borderBottom: "2px solid #eee",
  };

  const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
  };

  const checkboxStyle = {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  };

  const actionBtnStyle = {
    padding: "8px 16px",
    border: "1px solid #ddd",
    background: "white",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  const saveBtnStyle = {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    marginRight: "10px",
  };

  const cancelBtnStyle = {
    background: "#95a5a6",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
  };

  const errorStyle = {
    background: "#fee",
    color: "#e74c3c",
    padding: "12px",
    borderRadius: "5px",
    marginBottom: "20px",
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {existingAttendance ? "Edit Attendance" : "Take Attendance"}
          </h2>
          <button style={closeBtnStyle} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>
              Meeting Date:
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              required
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                width: "200px",
              }}
              disabled={!!existingAttendance}
            />
          </div>

          <div style={statsContainerStyle}>
            <div style={statItemStyle}>
              <span style={statValueStyle}>{members.length}</span>
              <span style={statLabelStyle}>Total Members</span>
            </div>
            <div style={statItemStyle}>
              <span style={statValueStyle}>{totalAttended}</span>
              <span style={statLabelStyle}>Present</span>
            </div>
            <div style={statItemStyle}>
              <span style={statValueStyle}>{attendanceRate}%</span>
              <span style={statLabelStyle}>Attendance Rate</span>
            </div>
          </div>

          <div style={buttonGroupStyle}>
            <button
              type="button"
              style={actionBtnStyle}
              onClick={handleMarkAllPresent}
            >
              ✓ Mark All Present
            </button>
            <button
              type="button"
              style={actionBtnStyle}
              onClick={handleMarkAllAbsent}
            >
              ✗ Mark All Absent
            </button>
          </div>

          {members.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "#7f8c8d",
            }}>
              No members in this ministry yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleToggleSelectAll}
                        style={checkboxStyle}
                      />
                    </th>
                    <th style={thStyle}>Membership No.</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Check-in Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.memberId}>
                      <td style={tdStyle}>
                        <input
                          type="checkbox"
                          checked={attendee.attended}
                          onChange={() => handleToggleAttendee(attendee.memberId)}
                          style={checkboxStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          background: "#3498db",
                          color: "white",
                          padding: "3px 10px",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                        }}>
                          {attendee.membershipNumber}
                        </span>
                      </td>
                      <td style={tdStyle}>{attendee.fullName}</td>
                      <td style={tdStyle}>
                        {attendee.checkInTime || (
                          <span style={{ color: "#7f8c8d" }}>Not checked in</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && <div style={errorStyle}>{error}</div>}

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button
              type="submit"
              style={saveBtnStyle}
              disabled={loading || members.length === 0}
            >
              {loading ? "Saving..." : existingAttendance ? "Update Attendance" : "Save Attendance"}
            </button>
            <button
              type="button"
              style={cancelBtnStyle}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;