import React, { useState, useEffect } from "react";
import "./Room.css";

function Room({ 
  roomCode, 
  players, 
  isHost, 
  selectedSubject, 
  onStartGame, 
  onLeaveRoom,
  user 
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if current user is in players list
  const currentPlayer = players.find(p => p.id === user?.uid);
  const isInRoom = !!currentPlayer;

  // Generate array of 8 player slots
  const playerSlots = Array(8).fill(null);
  players.forEach((player, index) => {
    if (index < 8) playerSlots[index] = player;
  });

  return (
    <div className="room-container">
      <h1 className="room-logo">EDUDICE</h1>
      
      <div className="room-code-section">
        <span className="room-code-label">CODE:</span>
        <span className="room-code">{roomCode}</span>
        <button onClick={handleCopyCode} className="copy-button">
          {copied ? "COPIED!" : "COPY"}
        </button>
      </div>

      <div className="subject-info">
        SUBJECT: {selectedSubject?.toUpperCase()}
      </div>

      <h3 className="waiting-text">WAITING FOR PLAYER...</h3>
      
      <div className="players-grid">
        {playerSlots.map((player, index) => (
          <div 
            key={index} 
            className={`player-slot ${player ? 'filled' : ''} ${player?.id === user?.uid ? 'current-user' : ''}`}
          >
            {player ? (
              <>
                <span className="player-indicator">●</span>
                <span className="player-name">
                  {player.name}
                  {player.id === user?.uid && " (YOU)"}
                </span>
                {player.isHost && <span className="host-badge">HOST</span>}
              </>
            ) : (
              <span className="empty-slot">PLAYER {index + 1}</span>
            )}
          </div>
        ))}
      </div>

      <div className="room-actions">
        {isHost ? (
          <button 
            onClick={onStartGame} 
            className="start-button"
            disabled={players.length < 2}
          >
            {players.length < 2 ? "WAITING FOR PLAYERS..." : "START GAME"}
          </button>
        ) : (
          <div className="waiting-host-message">
            {isInRoom ? "WAITING FOR HOST TO START..." : "YOU ARE NOT IN THIS ROOM"}
          </div>
        )}
        <button onClick={onLeaveRoom} className="leave-button">
          LEAVE ROOM
        </button>
      </div>
    </div>
  );
}

export default Room;