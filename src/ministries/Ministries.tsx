import React, { useState, useEffect } from "react";
import AddMinistryModal from "./AddMinistryModal";
import MinistryCard from "./MinistryCard";
import { 
  subscribeToMinistries, 
  addMinistry, 
  deleteMinistry 
} from "./ministryService";
import type { Ministry, MinistryInput } from "./ministryTypes";

const Ministries: React.FC = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToMinistries((fetchedMinistries) => {
      setMinistries(fetchedMinistries);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleAddMinistry = async (ministryInput: MinistryInput) => {
    try {
      await addMinistry(ministryInput);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to add ministry");
    }
  };

  const handleDeleteMinistry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ministry? This will also remove all member associations with this ministry.")) {
      return;
    }
    
    setDeleteLoading(id);
    setError(null);
    
    try {
      await deleteMinistry(id);
    } catch (err) {
      setError("Failed to delete ministry. Please try again.");
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ministries...</p>
      </div>
    );
  }

  return (
    <div className="ministries-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Ministries</h1>
          <p className="page-subtitle">Manage church ministries and their members</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Ministry
        </button>
      </div>

      {error && (
        <div className="error-alert">
          {error}
          <button 
            className="close-error" 
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {ministries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3>No Ministries Yet</h3>
          <p>Start by adding your first ministry to organize church activities and groups.</p>
          <button 
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Add First Ministry
          </button>
        </div>
      ) : (
        <>
          <div className="ministries-stats">
            <div className="stat-card">
              <div className="stat-number">{ministries.length}</div>
              <div className="stat-label">Total Ministries</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {ministries.reduce((total, ministry) => total + ministry.memberCount, 0)}
              </div>
              <div className="stat-label">Total Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {Math.round(ministries.reduce((total, ministry) => total + ministry.memberCount, 0) / ministries.length) || 0}
              </div>
              <div className="stat-label">Avg. Members</div>
            </div>
          </div>
          
          <div className="ministries-grid">
            {ministries.map((ministry) => (
              <MinistryCard
                key={ministry.id}
                ministry={ministry}
                onDelete={handleDeleteMinistry}
                isDeleting={deleteLoading === ministry.id}
              />
            ))}
          </div>
        </>
      )}

      <AddMinistryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMinistry={handleAddMinistry}
      />
    </div>
  );
};

export default Ministries;