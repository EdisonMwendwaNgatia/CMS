import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { CellGroup } from "./attendanceTypes";

const CellGroups: React.FC = () => {
  const navigate = useNavigate();
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    leaderName: "",
    leaderEmail: "",
    meetingDay: "",
    meetingTime: "",
    location: ""
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cellGroups"), (snapshot) => {
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CellGroup[];
      setCellGroups(groups);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "cellGroups"), {
        ...formData,
        memberCount: 0,
        members: []
      });
      setFormData({
        name: "",
        leaderName: "",
        leaderEmail: "",
        meetingDay: "",
        meetingTime: "",
        location: ""
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error adding cell group:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this cell group?")) {
      try {
        await deleteDoc(doc(db, "cellGroups", id));
      } catch (err) {
        console.error("Error deleting cell group:", err);
      }
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

  const addBtnStyle = {
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "15px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const cardContentStyle = {
    flex: 1,
  };

  const cardTitleStyle = {
    color: "#2c3e50",
    marginBottom: "10px",
    fontSize: "1.2rem",
  };

  const cardDetailsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    color: "#7f8c8d",
  };

  const deleteBtnStyle = {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Cell Groups</h1>
          <button 
            style={backBtnStyle}
            onClick={() => navigate("/dashboard/mark-attendance")}
          >
            ← Back
          </button>
        </div>
        <button style={addBtnStyle} onClick={() => setShowForm(!showForm)}>
          + Add Cell Group
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, flexDirection: "column", alignItems: "stretch" }}>
          <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>New Cell Group</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Group Name</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Leader Name</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  value={formData.leaderName}
                  onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Leader Email</label>
                <input
                  type="email"
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  value={formData.leaderEmail}
                  onChange={(e) => setFormData({ ...formData, leaderEmail: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Meeting Day</label>
                <select
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  value={formData.meetingDay}
                  onChange={(e) => setFormData({ ...formData, meetingDay: e.target.value })}
                  required
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Meeting Time</label>
                <input
                  type="time"
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: 500 }}>Location</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <button 
                type="submit" 
                style={{ 
                  background: "#3498db", 
                  color: "white", 
                  border: "none", 
                  padding: "10px 20px", 
                  borderRadius: "4px", 
                  cursor: "pointer",
                  marginRight: "10px"
                }}
              >
                Create Cell Group
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                style={{ 
                  background: "#95a5a6", 
                  color: "white", 
                  border: "none", 
                  padding: "10px 20px", 
                  borderRadius: "4px", 
                  cursor: "pointer" 
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {cellGroups.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px",
          background: "#f8f9fa",
          borderRadius: "10px",
          color: "#7f8c8d"
        }}>
          <h3>No Cell Groups Yet</h3>
          <p>Click "Add Cell Group" to create your first cell group.</p>
        </div>
      ) : (
        cellGroups.map(group => (
          <div key={group.id} style={cardStyle}>
            <div style={cardContentStyle}>
              <h3 style={cardTitleStyle}>{group.name}</h3>
              <div style={cardDetailsStyle}>
                <div><strong>Leader:</strong> {group.leaderName}</div>
                <div><strong>Meeting:</strong> {group.meetingDay} at {group.meetingTime}</div>
                <div><strong>Location:</strong> {group.location}</div>
                <div><strong>Members:</strong> {group.memberCount}</div>
                <div><strong>Email:</strong> {group.leaderEmail}</div>
              </div>
            </div>
            <button 
              style={deleteBtnStyle}
              onClick={() => handleDelete(group.id)}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default CellGroups;