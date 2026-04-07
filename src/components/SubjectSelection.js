import React, { useState } from "react";
import "./SubjectSelection.css";

function SubjectSelection({ onSelectSubject, onLogout, user }) {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const subjects = [
    { id: 'mathematics', name: 'MATHEMATICS' },
    { id: 'science', name: 'SCIENCE' },
    { id: 'english', name: 'ENGLISH' }
  ];

  const handleSubjectClick = (subjectId) => {
    setSelectedSubject(subjectId);
    setTimeout(() => {
      onSelectSubject(subjectId);
    }, 300);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="subject-container">
      <div className="subject-header">
        <h1 className="subject-logo">EDUDICE</h1>
        <button onClick={handleLogoutClick} className="subject-logout-button">
          LOGOUT
        </button>
      </div>
      
      <h2 className="subject-welcome">Welcome, {user?.displayName}!</h2>
      <h3 className="subject-title">CHOOSE SUBJECT</h3>
      
      <div className="subjects-grid">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className={`subject-card ${selectedSubject === subject.id ? 'selected' : ''} ${hoveredSubject === subject.id ? 'hovered' : ''}`}
            onClick={() => handleSubjectClick(subject.id)}
            onMouseEnter={() => setHoveredSubject(subject.id)}
            onMouseLeave={() => setHoveredSubject(null)}
          >
            <span className="subject-name">{subject.name}</span>
            <span className="subject-note">Create 19 custom questions</span>
          </div>
        ))}
      </div>

      <p className="subject-instruction">Select a subject to create your own questions</p>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-popup">
            <div className="confirm-header">LOGOUT</div>
            <div className="confirm-message">Are you sure you want to logout?</div>
            <div className="confirm-buttons">
              <button onClick={handleCancelLogout} className="confirm-cancel-button">
                CANCEL
              </button>
              <button onClick={handleConfirmLogout} className="confirm-logout-button">
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectSelection;