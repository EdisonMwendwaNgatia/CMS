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

  // Styles
  const containerStyle = {
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "100%",
  };

  const pageHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  };

  const headerContentStyle = {
    flex: 1,
  };

  const titleStyle = {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 4px 0",
    letterSpacing: "-0.02em",
  };

  const subtitleStyle = {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: 0,
  };

  const addButtonStyle = {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
  };

  const errorAlertStyle = {
    backgroundColor: "#fef2f2",
    borderLeft: "4px solid #ef4444",
    color: "#b91c1c",
    padding: "16px 20px",
    borderRadius: "12px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const closeErrorStyle = {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#b91c1c",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "background 0.2s",
  };

  const statsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  };

  const statCardStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    padding: "24px",
    color: "white",
    boxShadow: "0 10px 30px -5px rgba(102, 126, 234, 0.4)",
  };

  const statNumberStyle = {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "4px",
    lineHeight: 1.2,
  };

  const statLabelStyle = {
    fontSize: "0.9rem",
    opacity: 0.9,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const altStatCardStyle = {
    ...statCardStyle,
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  };

  const thirdStatCardStyle = {
    ...statCardStyle,
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
    marginTop: "8px",
  };

  const emptyStateStyle = {
    textAlign: "center" as const,
    padding: "60px 40px",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    marginTop: "40px",
  };

  const emptyIconStyle = {
    color: "#94a3b8",
    marginBottom: "20px",
  };

  const emptyTitleStyle = {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "8px",
  };

  const emptyTextStyle = {
    color: "#64748b",
    marginBottom: "24px",
    fontSize: "1rem",
  };

  const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
  };

  const spinnerStyle = {
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
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
        <div style={loadingContainerStyle}>
          <div style={spinnerStyle}></div>
          <p style={{ color: "#64748b" }}>Loading ministries...</p>
        </div>
      </>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      
      <div style={pageHeaderStyle}>
        <div style={headerContentStyle}>
          <h1 style={titleStyle}>Ministries</h1>
          <p style={subtitleStyle}>Manage church ministries and their members</p>
        </div>
        <button 
          style={addButtonStyle}
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#3b82f6";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>+</span> Add Ministry
        </button>
      </div>

      {error && (
        <div style={errorAlertStyle}>
          <span>{error}</span>
          <button 
            style={closeErrorStyle}
            onClick={() => setError(null)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fee2e2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
        </div>
      )}

      {ministries.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 style={emptyTitleStyle}>No Ministries Yet</h3>
          <p style={emptyTextStyle}>Start by adding your first ministry to organize church activities and groups.</p>
          <button 
            style={addButtonStyle}
            onClick={() => setIsModalOpen(true)}
          >
            Add First Ministry
          </button>
        </div>
      ) : (
        <>
          <div style={statsContainerStyle}>
            <div style={statCardStyle}>
              <div style={statNumberStyle}>{ministries.length}</div>
              <div style={statLabelStyle}>Total Ministries</div>
            </div>
            <div style={altStatCardStyle}>
              <div style={statNumberStyle}>
                {ministries.reduce((total, ministry) => total + ministry.memberCount, 0)}
              </div>
              <div style={statLabelStyle}>Total Members</div>
            </div>
            <div style={thirdStatCardStyle}>
              <div style={statNumberStyle}>
                {Math.round(ministries.reduce((total, ministry) => total + ministry.memberCount, 0) / ministries.length) || 0}
              </div>
              <div style={statLabelStyle}>Avg. Members</div>
            </div>
          </div>
          
          <div style={gridStyle}>
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