import { useState } from "react";
import { addMember } from "./memberService";
import type { MemberStatus } from "./memberTypes";

export default function AddMemberModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    maritalStatus: "",
    occupation: "",
    profilePhotoUrl: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await addMember({
        ...form,
        // Convert empty string to "N/A" for profilePhotoUrl
        profilePhotoUrl: form.profilePhotoUrl.trim() || "N/A",
        status: "full_member" as MemberStatus,
        baptism: {},
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Add Member</h3>

        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
        />

        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input type="date" name="dob" value={form.dob} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="address" placeholder="Physical Address" value={form.address} onChange={handleChange} />
        <input name="maritalStatus" placeholder="Marital Status" value={form.maritalStatus} onChange={handleChange} />
        <input name="occupation" placeholder="Occupation" value={form.occupation} onChange={handleChange} />

        <input
          name="profilePhotoUrl"
          placeholder="Profile Photo URL (optional)"
          value={form.profilePhotoUrl}
          onChange={handleChange}
        />

        <div style={{ marginTop: 12 }}>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Member"}
          </button>

          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}