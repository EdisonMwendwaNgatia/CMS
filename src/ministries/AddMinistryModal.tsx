import React, { useState } from "react";
import type { MinistryInput } from "./ministryTypes";

interface AddMinistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMinistry: (ministry: MinistryInput) => Promise<void>;
}

const AddMinistryModal: React.FC<AddMinistryModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddMinistry 
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [meetingDay, setMeetingDay] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meetingDays = [
    "Sunday",
    "Monday", 
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onAddMinistry({
        name,
        description,
        leaderName,
        leaderEmail,
        meetingDay,
        meetingTime,
        meetingLocation,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setLeaderName("");
      setLeaderEmail("");
      setMeetingDay("");
      setMeetingTime("");
      setMeetingLocation("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add ministry");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Ministry</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Ministry Name *</label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Worship Team, Youth Ministry"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              placeholder="Describe the purpose and activities of this ministry"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="leaderName">Leader Name *</label>
            <input
              id="leaderName"
              type="text"
              placeholder="Enter leader's full name"
              value={leaderName}
              onChange={e => setLeaderName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="leaderEmail">Leader Email *</label>
            <input
              id="leaderEmail"
              type="email"
              placeholder="leader@example.com"
              value={leaderEmail}
              onChange={e => setLeaderEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="meetingDay">Meeting Day *</label>
              <select
                id="meetingDay"
                value={meetingDay}
                onChange={e => setMeetingDay(e.target.value)}
                required
              >
                <option value="">Select Day</option>
                {meetingDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="meetingTime">Meeting Time *</label>
              <input
                id="meetingTime"
                type="time"
                value={meetingTime}
                onChange={e => setMeetingTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="meetingLocation">Meeting Location *</label>
            <input
              id="meetingLocation"
              type="text"
              placeholder="e.g., Main Sanctuary, Room 201"
              value={meetingLocation}
              onChange={e => setMeetingLocation(e.target.value)}
              required
            />
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Ministry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMinistryModal;