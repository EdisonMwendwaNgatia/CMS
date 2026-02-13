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
      : "https://via.placeholder.com/100";

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "full member": "#2ecc71",
      "new member": "#3498db",
      inactive: "#95a5a6",
      suspended: "#e74c3c",
    };
    return colors[status] || "#95a5a6";
  };

  const cardStyle = {
    display: "flex",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "white",
    transition: "all 0.2s",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    height: "100px",
  };

  const imageStyle = {
    width: "100px",
    height: "100px",
    objectFit: "cover" as const,
    borderRight: "1px solid #e0e0e0",
  };

  const contentStyle = {
    flex: 1,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    position: "relative" as const,
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  };

  const nameStyle = {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const badgeStyle = {
    background: getStatusColor(member.status),
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.65rem",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.3px",
    whiteSpace: "nowrap" as const,
  };

  const membershipStyle = {
    background: "#f0f7ff",
    color: "#3498db",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "600",
    display: "inline-block",
    marginBottom: "6px",
  };

  const infoRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#7f8c8d",
    fontSize: "0.8rem",
  };

  const iconStyle = {
    width: "14px",
    textAlign: "center" as const,
    color: "#95a5a6",
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
        e.currentTarget.style.borderColor = "#3498db";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
        e.currentTarget.style.borderColor = "#e0e0e0";
      }}
    >
      <img src={photoUrl} alt={member.fullName} style={imageStyle} />
      
      <div style={contentStyle}>
        <div style={headerStyle}>
          <h3 style={nameStyle}>{member.fullName}</h3>
          <span style={badgeStyle}>
            {member.status === "full member" ? "Full" : 
             member.status === "new member" ? "New" : 
             member.status === "inactive" ? "Inactive" : "Suspended"}
          </span>
        </div>

        <div style={membershipStyle}>
          {member.membershipNumber}
        </div>

        <div style={infoRowStyle}>
          <span style={iconStyle}>📞</span>
          <span>{member.phone}</span>
        </div>
        
        <div style={infoRowStyle}>
          <span style={iconStyle}>✉️</span>
          <span style={{
            whiteSpace: "nowrap" as const,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {member.email}
          </span>
        </div>
      </div>
    </div>
  );
}