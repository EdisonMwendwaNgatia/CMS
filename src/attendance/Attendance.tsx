import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  subscribeToAttendance, 
  subscribeToAttendanceEntities,
  subscribeToAttendanceSummary,
  deleteAttendanceRecord 
} from "./attendanceService";
import type { AttendanceRecord, AttendanceEntity, AttendanceSummary } from "./attendanceTypes";

const Attendance: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [entities, setEntities] = useState<AttendanceEntity[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  useEffect(() => {
    // Subscribe to attendance records
    const unsubscribeRecords = subscribeToAttendance(
      (fetchedRecords) => {
        setRecords(fetchedRecords);
        setLoading(false);
      },
      {
        entityType: selectedEntityType !== "all" ? selectedEntityType : undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }
    );
    
    // Subscribe to attendance entities (ministries, etc.)
    const unsubscribeEntities = subscribeToAttendanceEntities((fetchedEntities) => {
      setEntities(fetchedEntities);
    });
    
    // Subscribe to attendance summary
    const unsubscribeSummary = subscribeToAttendanceSummary(
      (fetchedSummary) => {
        setSummary(fetchedSummary);
      },
      dateRange.startDate,
      dateRange.endDate
    );
    
    return () => {
      unsubscribeRecords();
      unsubscribeEntities();
      unsubscribeSummary();
    };
  }, [selectedEntityType, dateRange.startDate, dateRange.endDate]);

  const handleDeleteRecord = async (recordId: string, entityName: string, meetingDate: string) => {
    if (window.confirm(`Delete attendance record for ${entityName} on ${meetingDate}?`)) {
      try {
        await deleteAttendanceRecord(recordId);
      } catch (err) {
        console.error(err);
        window.alert("Failed to delete attendance record");
      }
    }
  };

  const getEntityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ministry: "#3498db",
      service: "#9b59b6",
      event: "#e67e22",
      small_group: "#1abc9c",
    };
    return colors[type] || "#95a5a6";
  };

  const containerStyle = {
    padding: "20px",
    maxWidth: "1400px",
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

  const filterSectionStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "30px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const filterGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    alignItems: "end",
  };

  const filterItemStyle = {
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

  const selectStyle = {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1rem",
    background: "white",
  };

  const inputStyle = {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1rem",
  };

  const summaryGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  };

  const summaryCardStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const summaryTitleStyle = {
    color: "#7f8c8d",
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "10px",
  };

  const summaryValueStyle = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "5px",
  };

  const summarySubStyle = {
    color: "#7f8c8d",
    fontSize: "0.9rem",
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

  const entityBadgeStyle = {
    padding: "3px 10px",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "white",
    display: "inline-block",
  };

  const rateBadgeStyle = {
    padding: "3px 10px",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "white",
    display: "inline-block",
  };

  const actionBtnStyle = {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    marginRight: "5px",
  };

  const deleteBtnStyle = {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
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
          <p>Loading attendance data...</p>
        </div>
      </>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>Attendance</h1>
      </div>

      {/* Filter Section */}
      <div style={filterSectionStyle}>
        <div style={filterGridStyle}>
          <div style={filterItemStyle}>
            <span style={labelStyle}>Entity Type</span>
            <select
              style={selectStyle}
              value={selectedEntityType}
              onChange={(e) => {
                setLoading(true);
                setSelectedEntityType(e.target.value);
              }}
            >
              <option value="all">All Types</option>
              <option value="ministry">Ministries</option>
              <option value="service">Services</option>
              <option value="event">Events</option>
              <option value="small_group">Small Groups</option>
            </select>
          </div>
          
          <div style={filterItemStyle}>
            <span style={labelStyle}>Start Date</span>
            <input
              type="date"
              style={inputStyle}
              value={dateRange.startDate}
              onChange={(e) => {
                setLoading(true);
                setDateRange({ ...dateRange, startDate: e.target.value });
              }}
            />
          </div>
          
          <div style={filterItemStyle}>
            <span style={labelStyle}>End Date</span>
            <input
              type="date"
              style={inputStyle}
              value={dateRange.endDate}
              onChange={(e) => {
                setLoading(true);
                setDateRange({ ...dateRange, endDate: e.target.value });
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={summaryGridStyle}>
          <div style={summaryCardStyle}>
            <div style={summaryTitleStyle}>Total Events</div>
            <div style={summaryValueStyle}>{summary.totalEvents}</div>
            <div style={summarySubStyle}>In selected period</div>
          </div>
          
          <div style={summaryCardStyle}>
            <div style={summaryTitleStyle}>Total Attendance</div>
            <div style={summaryValueStyle}>{summary.totalAttended}</div>
            <div style={summarySubStyle}>
              Out of {summary.totalMembers} members
            </div>
          </div>
          
          <div style={summaryCardStyle}>
            <div style={summaryTitleStyle}>Overall Rate</div>
            <div style={summaryValueStyle}>{summary.overallRate}%</div>
            <div style={summarySubStyle}>Average attendance</div>
          </div>
          
          <div style={summaryCardStyle}>
            <div style={summaryTitleStyle}>Active Entities</div>
            <div style={summaryValueStyle}>{entities.length}</div>
            <div style={summarySubStyle}>
              {records.length} events recorded
            </div>
          </div>
        </div>
      )}

      {/* Breakdown by Entity Type */}
      {summary && Object.keys(summary.breakdown).length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Attendance by Type</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Events</th>
                  <th style={tableHeaderStyle}>Members</th>
                  <th style={tableHeaderStyle}>Attended</th>
                  <th style={tableHeaderStyle}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.breakdown).map(([type, data]) => (
                  <tr key={type}>
                    <td style={tableCellStyle}>
                      <span style={{
                        ...entityBadgeStyle,
                        backgroundColor: getEntityTypeColor(type),
                      }}>
                        {type}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{data.count}</td>
                    <td style={tableCellStyle}>{data.members}</td>
                    <td style={tableCellStyle}>{data.attended}</td>
                    <td style={tableCellStyle}>
                      <span style={{
                        ...rateBadgeStyle,
                        background: data.rate >= 70 ? "#2ecc71" : data.rate >= 50 ? "#f39c12" : "#e74c3c",
                      }}>
                        {data.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entities List (Ministries, etc.) */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Active Entities</h2>
        {entities.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#7f8c8d",
            background: "#f8f9fa",
            borderRadius: "5px",
          }}>
            <p>No active entities found.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Members</th>
                  <th style={tableHeaderStyle}>Schedule</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((entity) => (
                  <tr key={entity.id}>
                    <td style={tableCellStyle}>
                      <strong>{entity.name}</strong>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        ...entityBadgeStyle,
                        backgroundColor: getEntityTypeColor(entity.type),
                      }}>
                        {entity.type}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{entity.memberCount}</td>
                    <td style={tableCellStyle}>
                      {entity.meetingDay && entity.meetingTime 
                        ? `${entity.meetingDay} at ${entity.meetingTime}`
                        : 'Not scheduled'}
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        style={actionBtnStyle}
                        onClick={() => {
                          if (entity.type === 'ministry') {
                            navigate(`/dashboard/ministries/${entity.id}`);
                          }
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Attendance Records */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Recent Attendance Records</h2>
        {records.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#7f8c8d",
            background: "#f8f9fa",
            borderRadius: "5px",
          }}>
            <p>No attendance records found for the selected filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Date</th>
                  <th style={tableHeaderStyle}>Entity</th>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Present</th>
                  <th style={tableHeaderStyle}>Total</th>
                  <th style={tableHeaderStyle}>Rate</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td style={tableCellStyle}>
                      {new Date(record.meetingDate).toLocaleDateString()}
                    </td>
                    <td style={tableCellStyle}>
                      <strong>{record.entityName}</strong>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        ...entityBadgeStyle,
                        backgroundColor: getEntityTypeColor(record.entityType),
                      }}>
                        {record.entityType}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{record.totalAttended}</td>
                    <td style={tableCellStyle}>{record.totalMembers}</td>
                    <td style={tableCellStyle}>
                      <span style={{
                        ...rateBadgeStyle,
                        background: (record.attendanceRate ?? 0) >= 70 ? "#2ecc71" : 
                                   (record.attendanceRate ?? 0) >= 50 ? "#f39c12" : "#e74c3c",
                      }}>
                        {(record.attendanceRate ?? 0).toFixed(0)}%
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        style={deleteBtnStyle}
                        onClick={() => handleDeleteRecord(record.id!, record.entityName, record.meetingDate)}
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
    </div>
  );
};

export default Attendance;