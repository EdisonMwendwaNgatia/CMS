import React, { useState } from 'react';
import { getFamilies } from './familyService';
import FamilyDetails from './FamilyDetails';

const FamilyList: React.FC = () => {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const families = getFamilies();

  return (
    <div>
      <h2>Families</h2>
      <ul>
        {families.map(family => (
          <li key={family.id}>
            <button onClick={() => setSelectedFamilyId(family.id)}>
              {family.familyName}
            </button>
          </li>
        ))}
      </ul>
      {selectedFamilyId && (
        <FamilyDetails familyId={selectedFamilyId} onClose={() => setSelectedFamilyId(null)} />
      )}
    </div>
  );
};

export default FamilyList;
