import { useState } from "react";
import type { Member } from "./memberTypes";
import MemberStatusSelector from "./MemberStatusSelector";
import { updateMember } from "./memberService";

export default function MemberDetailsModal({
  member,
  onClose,
  onUpdated,
}: {
  member: Member;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [data, setData] = useState<Member>({ ...member });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleBaptismChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      baptism: {
        ...data.baptism,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSave = async () => {
    await updateMember(member.id!, data);
    onUpdated();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Member Details</h3>

        <input name="fullName" value={data.fullName} onChange={handleChange} />
        <input name="phone" value={data.phone} onChange={handleChange} />
        <input name="email" value={data.email} onChange={handleChange} />
        <input name="address" value={data.address} onChange={handleChange} />
        <input name="occupation" value={data.occupation} onChange={handleChange} />

        <MemberStatusSelector
          value={data.status}
          onChange={(status) => setData({ ...data, status })}
        />

        <h4>Baptism Info</h4>
        <input
          type="date"
          name="date"
          value={data.baptism?.date || ""}
          onChange={handleBaptismChange}
        />
        <input
          name="place"
          placeholder="Place"
          value={data.baptism?.place || ""}
          onChange={handleBaptismChange}
        />
        <input
          name="minister"
          placeholder="Minister"
          value={data.baptism?.minister || ""}
          onChange={handleBaptismChange}
        />

        <div style={{ marginTop: 12 }}>
          <button onClick={handleSave}>Save Changes</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
