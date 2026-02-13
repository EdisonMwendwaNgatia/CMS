import React, { useState } from 'react';
import { addFamily } from './familyService';
import type { Family, FamilyMemberLink } from './familyTypes';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { getMembers } from '../members/memberService';
// import type { Member } from '../members/memberTypes';

interface AddFamilyModalProps {
  onClose: () => void;
}

const AddFamilyModal: React.FC<AddFamilyModalProps> = ({ onClose }) => {
  const [familyName, setFamilyName] = useState('');
  const [members, setMembers] = useState<FamilyMemberLink[]>([
    { membershipNumber: '', relationship: 'Husband' },
  ]);
  const [allMembershipNumbers, setAllMembershipNumbers] = useState<string[]>([]);
  const [memberErrors, setMemberErrors] = useState<string[]>([]);

  useEffect(() => {
    getMembers().then((members) => {
      type MinimalMember = { membershipNumber?: string };
      setAllMembershipNumbers(
        (members as MinimalMember[]).map((m) => m.membershipNumber?.toUpperCase() || '')
      );
    });
  }, []);

  const handleMemberChange = (idx: number, field: 'membershipNumber' | 'relationship', value: string) => {
    setMembers(members =>
      members.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
    if (field === 'membershipNumber') {
      validateMembershipNumber(idx, value);
    }
  };

  const validateMembershipNumber = (idx: number, value: string) => {
    const val = value.trim().toUpperCase();
    let error = '';
    if (val && !allMembershipNumbers.includes(val)) {
      error = 'Membership number does not exist';
    }
    setMemberErrors((errs) => {
      const newErrs = [...errs];
      newErrs[idx] = error;
      return newErrs;
    });
  };

  const handleAddMember = () => {
    setMembers([...members, { membershipNumber: '', relationship: 'Relative' }]);
  };

  const handleRemoveMember = (idx: number) => {
    setMembers(members => members.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredMembers = members.filter(m => m.membershipNumber.trim() !== '');
    const newFamily: Family = {
      id: uuidv4(),
      familyName,
      members: filteredMembers,
    };
    addFamily(newFamily);
    onClose();
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16 }}>
      <h3>Add Family</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Family Name:
          <input value={familyName} onChange={e => setFamilyName(e.target.value)} required />
        </label>
        <br />
        <h4>Family Members</h4>
        {members.map((member, idx) => (
          <div key={idx} style={{ marginBottom: 8, border: '1px solid #eee', padding: 8 }}>
            <input
              placeholder="Membership Number"
              value={member.membershipNumber}
              onChange={e => handleMemberChange(idx, 'membershipNumber', e.target.value)}
              onBlur={e => validateMembershipNumber(idx, e.target.value)}
              required
              style={memberErrors[idx] ? { borderColor: 'red' } : {}}
            />
            <select
              value={member.relationship}
              onChange={e => handleMemberChange(idx, 'relationship', e.target.value)}
            >
              <option value="Husband">Husband</option>
              <option value="Wife">Wife</option>
              <option value="Child">Child</option>
              <option value="Relative">Relative</option>
              <option value="Other">Other</option>
            </select>
            {members.length > 1 && (
              <button type="button" onClick={() => handleRemoveMember(idx)} style={{ marginLeft: 8 }}>
                Remove
              </button>
            )}
            {memberErrors[idx] && (
              <div style={{ color: 'red', fontSize: 12 }}>{memberErrors[idx]}</div>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddMember} style={{ marginBottom: 8 }}>
          + Add Member
        </button>
        <br />
  <button type="submit" disabled={memberErrors.some(e => e)}>Add</button>
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
      </form>
    </div>
  );
};

export default AddFamilyModal;
