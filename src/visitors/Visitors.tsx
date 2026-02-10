import React, { useState } from "react";
import VisitorCard from "./VisitorCard";
import VisitorDetailsModal from "./VisitorDetailsModal";
import type { Visitor } from "./visitorTypes";
import { subscribeToVisitors, addVisitor, convertVisitorToMember } from "./visitorService";
import AddVisitorModal from "./AddVisitorModal";

// Removed unused initialVisitors

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

  return (
    <div>
      <h2>Visitors</h2>
      <button onClick={() => setIsModalOpen(true)}>Add Visitor</button>
      <AddVisitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddVisitor={handleAddVisitor}
      />
      {loading && <p>Loading visitors...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="visitor-list">
        {preMembers.length === 0 && !loading ? (
          <p>No visitors yet.</p>
        ) : (
          preMembers.map(visitor => (
            <div key={visitor.id} onClick={() => setSelectedVisitor(visitor)} style={{ cursor: 'pointer' }}>
              <VisitorCard
                visitor={visitor}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))
        )}
      </div>
      {/* Visitor details modal */}
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
