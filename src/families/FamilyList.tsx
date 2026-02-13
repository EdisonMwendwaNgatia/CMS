import React, { useState, useEffect } from 'react';
import { getFamilies, subscribeToFamilies } from './familyService';
import FamilyDetails from './FamilyDetails';
import type { Family } from './familyTypes';

const FamilyList: React.FC = () => {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>(getFamilies());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToFamilies((updatedFamilies) => {
      setFamilies(updatedFamilies);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const containerStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '15px 20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #eee',
  };

  const headerTitleStyle = {
    color: '#2c3e50',
    fontSize: '1.2rem',
    fontWeight: '600',
    margin: 0,
  };

  const listStyle = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  };

  const listItemStyle = {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.3s',
  };

  const familyButtonStyle = {
    width: '100%',
    padding: '16px 20px',
    background: 'none',
    border: 'none',
    textAlign: 'left' as const,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#34495e',
    fontSize: '1rem',
  };

  const familyNameStyle = {
    fontWeight: '500',
    color: '#2c3e50',
  };

  const memberCountStyle = {
    background: '#3498db',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
  };

  const emptyStateStyle = {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#7f8c8d',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  };

  const loadingStyle = {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#7f8c8d',
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        Loading families...
      </div>
    );
  }

  if (families.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <p style={{ margin: 0, fontSize: '1rem' }}>
          No families found. Click "Add Family" to create your first family.
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={headerTitleStyle}>All Families ({families.length})</h3>
      </div>
      
      <ul style={listStyle}>
        {families.map(family => (
          <li key={family.id} style={listItemStyle}>
            <button
              style={familyButtonStyle}
              onClick={() => setSelectedFamilyId(family.id)}
              onMouseEnter={(e) => {
                e.currentTarget.parentElement!.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.parentElement!.style.backgroundColor = 'transparent';
              }}
            >
              <span style={familyNameStyle}>{family.familyName}</span>
              <span style={memberCountStyle}>
                {family.members?.length || 0} members
              </span>
            </button>
          </li>
        ))}
      </ul>
      
      {selectedFamilyId && (
        <FamilyDetails 
          familyId={selectedFamilyId} 
          onClose={() => setSelectedFamilyId(null)} 
        />
      )}
    </div>
  );
};

export default FamilyList;