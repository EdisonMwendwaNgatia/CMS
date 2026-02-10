import { useEffect, useState } from "react";
import { subscribeToMembers } from "./memberService";
import type { Member } from "./memberTypes";
import MemberCard from "./MemberCard";
import AddMemberModal from "./AddMemberModal";
import MemberDetailsModal from "./MemberDetailsModal";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMembers((data: Member[]) => {
      setMembers(data);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Members</h2>
        <button onClick={() => setShowAddModal(true)}>Add Member</button>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {members.map((m) => (
          <MemberCard
            key={m.id}
            member={m}
            onClick={() => setSelectedMember(m)}
          />
        ))}
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}
