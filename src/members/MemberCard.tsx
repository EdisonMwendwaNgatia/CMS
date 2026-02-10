import type { Member } from "./memberTypes";

export default function MemberCard({
  member,
  onClick,
}: {
  member: Member;
  onClick: () => void;
}) {
  const photoUrl =
    member.profilePhotoUrl && member.profilePhotoUrl !== "N/A"
      ? member.profilePhotoUrl
      : "https://via.placeholder.com/150";

  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #ddd",
        padding: "1rem",
        borderRadius: 6,
        width: 260,
        cursor: "pointer",
      }}
    >
      <img
        src={photoUrl}
        alt="profile"
        style={{ width: "100%", height: 150, objectFit: "cover" }}
      />

      <h4>{member.fullName}</h4>
      <p><strong>{member.membershipNumber}</strong></p>
      <p>{member.phone}</p>
      <p>{member.gender}</p>
      <p>Status: {member.status}</p>
    </div>
  );
}
