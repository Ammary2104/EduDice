import React, { useState } from "react";
import "./MultiplayerOptions.css";

function MultiplayerOptions({ onCreateRoom, onJoinRoom, onBackToMode }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [error, setError] = useState("");

  const options = [
    { id: 'create', name: 'CREATE ROOM' },
    { id: 'join', name: 'JOIN ROOM' }
  ];

  const handleOptionClick = (optionId) => {
    setSelectedOption(optionId);
    setError("");
    
    if (optionId === 'create') {
      setTimeout(() => {
        onCreateRoom();
      }, 300);
    } else {
      setShowJoinInput(true);
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!joinRoomId.trim()) {
      setError("Please enter a room code");
      return;
    }
    
    if (joinRoomId.length !== 6 || !/^\d+$/.test(joinRoomId)) {
      setError("Room code must be 6 digits");
      return;
    }
    
    // Pass the room code to parent component
    onJoinRoom(joinRoomId.trim());
  };

  const handleCancelJoin = () => {
    setShowJoinInput(false);
    setSelectedOption(null);
    setJoinRoomId("");
    setError("");
  };

  return (
    <div className="multiplayer-container">
      <div className="multiplayer-header">
        <h1 className="multiplayer-logo">EDUDICE</h1>
        <button onClick={onBackToMode} className="back-button">
          BACK
        </button>
      </div>
      
      <h2 className="multiplayer-title">MULTIPLAYER</h2>
      
      {!showJoinInput ? (
        <>
          <div className="options-grid">
            {options.map((option) => (
              <div
                key={option.id}
                className={`option-card ${selectedOption === option.id ? 'selected' : ''} ${hoveredOption === option.id ? 'hovered' : ''}`}
                onClick={() => handleOptionClick(option.id)}
                onMouseEnter={() => setHoveredOption(option.id)}
                onMouseLeave={() => setHoveredOption(null)}
              >
                <span className="option-name">{option.name}</span>
              </div>
            ))}
          </div>
          <p className="option-note">Create a new room or join an existing one</p>
        </>
      ) : (
        <div className="join-form-container">
          <form onSubmit={handleJoinSubmit} className="join-form">
            <div className="input-group">
              <span className="input-label">ENTER ROOM CODE</span>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="input-field"
                placeholder="123456"
                maxLength="6"
                autoFocus
              />
              {error && <p className="error-message">{error}</p>}
            </div>
            <div className="join-buttons">
              <button type="submit" className="join-submit-button">
                JOIN ROOM
              </button>
              <button type="button" onClick={handleCancelJoin} className="join-cancel-button">
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MultiplayerOptions;