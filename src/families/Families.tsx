import React, { useState, useEffect } from 'react';
import FamilyList from './FamilyList';
import AddFamilyModal from './AddFamilyModal';
import { loadFamilies, subscribeToFamilies } from './familyService';

const Families: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load families on mount
    loadFamilies()
      .then(() => setLoading(false))
      .catch((err) => {
        setError('Failed to load families');
        console.error(err);
        setLoading(false);
      });

    // Subscribe to real-time updates
    const unsubscribe = subscribeToFamilies(() => {
      // Families are updated in cache, FamilyList will re-render
    });

    return () => unsubscribe();
  }, []);

  const containerStyle = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  };

  const titleStyle = {
    color: '#2c3e50',
    fontSize: '2rem',
    margin: 0,
    fontWeight: '600',
  };

  const addButtonStyle = {
    background: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 5px rgba(46, 204, 113, 0.3)',
    transition: 'all 0.3s',
  };

  const loadingStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#7f8c8d',
  };

  const spinnerStyle = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  };

  const errorStyle = {
    background: '#fee',
    color: '#e74c3c',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #e74c3c',
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{keyframes}</style>
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <p>Loading families...</p>
        </div>
      </>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      
      <div style={headerStyle}>
        <h1 style={titleStyle}>Family Management</h1>
        <button 
          style={addButtonStyle}
          onClick={() => setShowAddModal(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#27ae60';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 10px rgba(46, 204, 113, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2ecc71';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 5px rgba(46, 204, 113, 0.3)';
          }}
        >
          <span>➕</span> Add Family
        </button>
      </div>

      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <FamilyList />
      
      {showAddModal && (
        <AddFamilyModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};

export default Families;