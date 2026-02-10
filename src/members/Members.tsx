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

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Members</h2>
        <button onClick={() => setShowAddModal(true)}>Add Member</button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by membership number, name, or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      {/* Members list */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {filteredMembers.length === 0 ? (
          <p>No members found.</p>
        ) : (
          filteredMembers.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onClick={() => setSelectedMember(m)}
            />
          ))
        )}
      </div>

      {/* Add member modal */}
      {showAddModal && (
        <AddMemberModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Member details modal */}
      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdated={() => {}}
        />
      )}
    </>
  );
}
