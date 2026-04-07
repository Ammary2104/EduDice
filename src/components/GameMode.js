import React, { useState } from "react";
import "./GameMode.css";

function GameMode({ onSelectMode, onLogout, user }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [hoveredMode, setHoveredMode] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const modes = [
    { id: 'solo', name: 'PLAY' }
  ];

  const handleModeClick = (modeId) => {
    setSelectedMode(modeId);
    setTimeout(() => {
      onSelectMode(modeId);
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
    <div className="mode-container">
      <div className="mode-header">
        <h1 className="mode-logo">EDUDICE</h1>
        <button onClick={handleLogoutClick} className="mode-logout-button">
          LOGOUT
        </button>
      </div>
      
      <h2 className="mode-welcome">Welcome, {user?.displayName}!</h2>
      <h3 className="mode-title">ARE YOU READY?</h3>
      
      <div className="modes-grid">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className={`mode-card ${selectedMode === mode.id ? 'selected' : ''} ${hoveredMode === mode.id ? 'hovered' : ''}`}
            onClick={() => handleModeClick(mode.id)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
          >
            <span className="mode-name">{mode.name}</span>
          </div>
        ))}
      </div>

      

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

export default GameMode;