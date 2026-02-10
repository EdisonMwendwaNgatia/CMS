import React, { useState } from "react";
import type { Visitor } from "./visitorTypes";

interface AddVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVisitor: (visitor: Omit<Visitor, "id" | "status">) => void;
}

const AddVisitorModal: React.FC<AddVisitorModalProps> = ({ isOpen, onClose, onAddVisitor }) => {
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  onAddVisitor({ fullName, phone, email, address, gender, dob });
  setFullName("");
    setPhone("");
    setEmail("");
    setAddress("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Visitor</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Gender"
            value={gender}
            onChange={e => setGender(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={dob}
            onChange={e => setDob(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
          <button type="submit">Add Visitor</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AddVisitorModal;
