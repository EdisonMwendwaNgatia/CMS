import type { MemberStatus } from "./memberTypes";

export default function MemberStatusSelector({
  value,
  onChange,
}: {
  value: MemberStatus;
  onChange: (status: MemberStatus) => void;
}) {
  return (
    <div>
      <label>Status</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MemberStatus)}
      >
        <option value="new_member">New Member</option>
        <option value="full_member">Full Member</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>
  );
}
