import React, { useState } from "react";
import type { Visitor } from "./visitorTypes";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface VisitorDetailsModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const VisitorDetailsModal: React.FC<VisitorDetailsModalProps> = ({ 
  visitor, 
  isOpen, 
  onClose, 
  onUpdated 
}) => {
  const [baptismDate, setBaptismDate] = useState("");
  const [baptismPlace, setBaptismPlace] = useState("");
  const [baptismMinister, setBaptismMinister] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visitor && visitor.baptism) {
      setBaptismDate(visitor.baptism.date || "");
      setBaptismPlace(visitor.baptism.place || "");
      setBaptismMinister(visitor.baptism.minister || "");
    } else {
      setBaptismDate("");
      setBaptismPlace("");
      setBaptismMinister("");
    }
  }, [visitor]);

  if (!isOpen || !visitor) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const ref = doc(db, "visitors", visitor.id!);
      await updateDoc(ref, {
        baptism: {
          date: baptismDate,
          place: baptismPlace,
          minister: baptismMinister,
        },
      });
      setSaving(false);
      if (onUpdated) onUpdated();
      onClose();
    } catch {
      setError("Failed to save baptism details");
      setSaving(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Visitor Details</h2>
        <p><strong>Name:</strong> {visitor.fullName}</p>
        <p><strong>Email:</strong> {visitor.email}</p>
        <p><strong>Phone:</strong> {visitor.phone}</p>
        <form onSubmit={handleSave}>
          <h3>Baptism Details</h3>
          <input
            type="date"
            placeholder="Baptism Date"
            value={baptismDate}
            onChange={e => setBaptismDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Baptism Place"
            value={baptismPlace}
            onChange={e => setBaptismPlace(e.target.value)}
          />
          <input
            type="text"
            placeholder="Minister"
            value={baptismMinister}
            onChange={e => setBaptismMinister(e.target.value)}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onClose}>Close</button>
        </form>
      </div>
    </div>
  );
};

export default VisitorDetailsModal;