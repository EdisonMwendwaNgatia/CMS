import { useEffect, useMemo, useState } from "react";
import { subscribeToMembers } from "./memberService";
import type { Member } from "./memberTypes";
import MemberCard from "./MemberCard";
import AddMemberModal from "./AddMemberModal";
import MemberDetailsModal from "./MemberDetailsModal";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMembers((data: Member[]) => {
      setMembers(data);
    });

    return unsubscribe;
  }, []);

  // 🔍 Search logic
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;

    const term = searchTerm.toLowerCase();

    return members.filter((m) => {
      return (
        m.membershipNumber.toLowerCase().includes(term) ||
        m.fullName.toLowerCase().includes(term) ||
        (m.phone && m.phone.toLowerCase().includes(term))
      );
    });
  }, [members, searchTerm]);

  const containerStyle = {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  };

  const titleStyle = {
    fontSize: "2rem",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
  };

  const addButtonStyle = {
    background: "#2ecc71",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s",
    boxShadow: "0 2px 5px rgba(46, 204, 113, 0.3)",
  };

  const searchInputStyle = {
    width: "100%",
    padding: "14px 20px",
    marginBottom: "30px",
    borderRadius: "10px",
    border: "2px solid #e0e0e0",
    fontSize: "1rem",
    transition: "all 0.3s",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const statsStyle = {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap" as const,
  };

  const statCardStyle = {
    background: "white",
    padding: "20px 25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    flex: "1",
    minWidth: "200px",
  };

  const statNumberStyle = {
    fontSize: "2rem",
    fontWeight: "600",
    color: "#3498db",
    marginBottom: "5px",
  };

  const statLabelStyle = {
    color: "#7f8c8d",
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const membersGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  };

  const emptyStateStyle = {
    textAlign: "center" as const,
    padding: "60px 20px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  };

  const emptyIconStyle = {
    fontSize: "48px",
    marginBottom: "20px",
    color: "#bdc3c7",
  };

  const emptyTitleStyle = {
    fontSize: "1.5rem",
    color: "#2c3e50",
    marginBottom: "10px",
  };

  const emptyTextStyle = {
    color: "#7f8c8d",
    marginBottom: "20px",
  };

  const modalBackdropStyle = {
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

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Members Directory</h1>
        <button
          style={addButtonStyle}
          onClick={() => setShowAddModal(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#27ae60";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2ecc71";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>+</span> Add Member
        </button>
      </div>

      {/* Stats Cards */}
      <div style={statsStyle}>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>{members.length}</div>
          <div style={statLabelStyle}>Total Members</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>
            {members.filter(m => m.status === "full_member").length}
          </div>
          <div style={statLabelStyle}>Full Members</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>
            {members.filter(m => m.status === "new_member").length}
          </div>
          <div style={statLabelStyle}>New Members</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>
            {members.filter(m => m.status === "inactive").length}
          </div>
          <div style={statLabelStyle}>Inactive</div>
        </div>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="🔍 Search by membership number, name, or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={searchInputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#3498db";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#e0e0e0";
          e.currentTarget.style.boxShadow = "none";
        }}
      />

      {/* Members count */}
      <div style={{ marginBottom: "15px", color: "#7f8c8d" }}>
        Showing {filteredMembers.length} of {members.length} members
      </div>

      {/* Members grid */}
      {filteredMembers.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>👥</div>
          <h3 style={emptyTitleStyle}>No Members Found</h3>
          <p style={emptyTextStyle}>
            {searchTerm 
              ? "Try adjusting your search criteria"
              : "Get started by adding your first member"}
          </p>
          {!searchTerm && (
            <button
              style={addButtonStyle}
              onClick={() => setShowAddModal(true)}
            >
              Add First Member
            </button>
          )}
        </div>
      ) : (
        <div style={membersGridStyle}>
          {filteredMembers.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onClick={() => setSelectedMember(m)}
            />
          ))}
        </div>
      )}

      {/* Add member modal */}
      {showAddModal && (
        <div style={modalBackdropStyle}>
          <AddMemberModal onClose={() => setShowAddModal(false)} />
        </div>
      )}

      {/* Member details modal */}
      {selectedMember && (
        <div style={modalBackdropStyle}>
          <MemberDetailsModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
            onUpdated={() => {}}
          />
        </div>
      )}
    </div>
  );
}