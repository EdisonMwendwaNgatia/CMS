import React from "react";
import type { Visitor } from "./visitorTypes";

interface VisitorCardProps {
  visitor: Visitor;
  onStatusChange?: (visitorId: string) => void;
}

const VisitorCard: React.FC<VisitorCardProps> = ({ visitor, onStatusChange }) => {
  return (
    <div className="visitor-card">
      <h3>{visitor.fullName}</h3>
      <p>Phone: {visitor.phone}</p>
      <p>Email: {visitor.email}</p>
      <p>Address: {visitor.address}</p>
      <p>Status: {visitor.status === "pre_member" ? "Visitor" : "Member"}</p>
      {visitor.status === "pre_member" && onStatusChange && visitor.id && (
        <button onClick={() => onStatusChange(visitor.id!)}>
          Convert to Member
        </button>
      )}
    </div>
  );
};

export default VisitorCard;
