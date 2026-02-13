import React, { useState } from "react";
import VisitorCard from "./VisitorCard";
import VisitorDetailsModal from "./VisitorDetailsModal";
import type { Visitor } from "./visitorTypes";
import { subscribeToVisitors, addVisitor, convertVisitorToMember } from "./visitorService";
import AddVisitorModal from "./AddVisitorModal";

const Visitors: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to visitors from Firestore
  React.useEffect(() => {
    setLoading(true);
    const unsub = subscribeToVisitors((data) => {
      setVisitors(data);
      setLoading(false);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleAddVisitor = async (visitorData: Omit<Visitor, "id" | "status">) => {
    setError(null);
    try {
      await addVisitor({ ...visitorData, status: "pre_member" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add visitor");
    }
  };

  const handleStatusChange = async (visitorId: string) => {
    setError(null);
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) throw new Error("Visitor not found");
      await convertVisitorToMember(visitor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert visitor");
    }
  };

  // Filter out visitors who have become members
  const preMembers = visitors.filter(v => v.status === "pre_member");

  const containerStyle = {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  };

  const titleStyle = {
    fontSize: "1.8rem",
    color: "#2c3e50",
    margin: 0,
  };

  const addButtonStyle = {
    backgroundColor: "#2ecc71",
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
    transition: "background 0.2s",
  };

  const statsStyle = {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
    padding: "15px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const statItemStyle = {
    flex: 1,
    textAlign: "center" as const,
  };

  const statValueStyle = {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#3498db",
  };

  const statLabelStyle = {
    fontSize: "0.85rem",
    color: "#7f8c8d",
    marginTop: "5px",
  };

  const loadingStyle = {
    textAlign: "center" as const,
    padding: "40px",
    color: "#7f8c8d",
    fontSize: "1.1rem",
  };

  const errorStyle = {
    backgroundColor: "#fee",
    color: "#e74c3c",
    padding: "12px 15px",
    borderRadius: "5px",
    marginBottom: "20px",
    borderLeft: "4px solid #e74c3c",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "15px",
  };

  const emptyStateStyle = {
    textAlign: "center" as const,
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    color: "#7f8c8d",
    fontSize: "1rem",
    border: "2px dashed #ddd",
  };

  const spinnerStyle = {
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #3498db",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "20px auto",
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>Visitors</h1>
        <button
          style={addButtonStyle}
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#27ae60";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2ecc71";
          }}
        >
          <span>➕</span> Add Visitor
        </button>
      </div>

      <div style={statsStyle}>
        <div style={statItemStyle}>
          <div style={statValueStyle}>{preMembers.length}</div>
          <div style={statLabelStyle}>Active Visitors</div>
        </div>
        <div style={statItemStyle}>
          <div style={statValueStyle}>{visitors.length - preMembers.length}</div>
          <div style={statLabelStyle}>Converted</div>
        </div>
        <div style={statItemStyle}>
          <div style={statValueStyle}>{visitors.length}</div>
          <div style={statLabelStyle}>Total</div>
        </div>
      </div>

      <AddVisitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddVisitor={handleAddVisitor}
      />
      
      {loading && (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <p>Loading visitors...</p>
        </div>
      )}
      
      {error && <div style={errorStyle}>{error}</div>}
      
      <div style={gridStyle}>
        {!loading && preMembers.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>No visitors yet. Click "Add Visitor" to get started.</p>
          </div>
        ) : (
          preMembers.map(visitor => (
            <div key={visitor.id} onClick={() => setSelectedVisitor(visitor)}>
              <VisitorCard
                visitor={visitor}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))
        )}
      </div>

      {selectedVisitor && (
        <VisitorDetailsModal
          visitor={selectedVisitor}
          isOpen={!!selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
        />
      )}
    </div>
  );
};

export default Visitors;