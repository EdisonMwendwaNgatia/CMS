import type { MemberStatus } from "./memberTypes";

export default function MemberStatusSelector({
  value,
  onChange,
}: {
  value: MemberStatus;
  onChange: (status: MemberStatus) => void;
}) {
  const containerStyle = {
    width: "100%",
  };

  const selectStyle = {
    width: "100%",
    padding: "12px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s",
    outline: "none",
    background: "white",
    cursor: "pointer",
  };

  const getStatusColor = (status: MemberStatus) => {
    const colors: Record<MemberStatus, string> = {
      new_member: "#3498db",
      full_member: "#2ecc71",
      inactive: "#95a5a6",
      suspended: "#e74c3c",
      visitor: "#34495e",
    };
    return colors[status] || "#95a5a6";
  };

  return (
    <div style={containerStyle}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MemberStatus)}
        style={{
          ...selectStyle,
          borderColor: getStatusColor(value),
          color: getStatusColor(value),
          fontWeight: "500",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#3b82f6";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = getStatusColor(value);
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <option value="new_member" style={{ color: "#3498db" }}>🆕 New Member</option>
        <option value="full_member" style={{ color: "#2ecc71" }}>✓ Full Member</option>
        <option value="inactive" style={{ color: "#95a5a6" }}>⏸️ Inactive</option>
        <option value="suspended" style={{ color: "#e74c3c" }}>⛔ Suspended</option>
      </select>
    </div>
  );
}