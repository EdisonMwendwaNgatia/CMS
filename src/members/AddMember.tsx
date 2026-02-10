import { useState } from "react";
import { addMember } from "./memberService";

export default function AddMember() {
  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    maritalStatus: "",
    occupation: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      await addMember(form);
      setMessage("Member added successfully");
      setForm({
        fullName: "",
        gender: "",
        dob: "",
        phone: "",
        email: "",
        address: "",
        maritalStatus: "",
        occupation: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h3>Add Member</h3>

      <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
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

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Save Member"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
