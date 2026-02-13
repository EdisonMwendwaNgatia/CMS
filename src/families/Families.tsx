import React, { useState } from 'react';
import FamilyList from './FamilyList';
import AddFamilyModal from './AddFamilyModal';

const Families: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div>
      <h1>Family Management</h1>
      <button onClick={() => setShowAddModal(true)}>Add Family</button>
      <FamilyList />
      {showAddModal && <AddFamilyModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default Families;
