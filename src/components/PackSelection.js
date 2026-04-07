import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./PackSelection.css";

function PackSelection({ user, subject, onSelectPack, onCreateNewPack, onBack }) {
  const [savedPacks, setSavedPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState(null);

  useEffect(() => {
    const loadSavedPacks = async () => {
      try {
        const q = query(
          collection(db, "questionPacks"),
          where("userId", "==", user.uid),
          where("subject", "==", subject)
        );
        
        const querySnapshot = await getDocs(q);
        const packs = [];
        querySnapshot.forEach((doc) => {
          packs.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setSavedPacks(packs);
      } catch (error) {
        console.error("Error loading packs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedPacks();
  }, [user, subject]);

  const handleSelectPack = (pack) => {
    setSelectedPack(pack.id);
    setTimeout(() => {
      onSelectPack(pack);
    }, 300);
  };

  const handleCreateNew = () => {
    onCreateNewPack();
  };

  if (loading) {
    return (
      <div className="pack-selection-container">
        <div className="loading-spinner"></div>
        <p>Loading your packs...</p>
      </div>
    );
  }

  return (
    <div className="pack-selection-container">
      <div className="pack-selection-header">
        <button onClick={onBack} className="back-button">
          ← BACK
        </button>
        <h1 className="pack-selection-logo">EDUDICE</h1>
        <div className="header-spacer"></div>
      </div>
      
      <h2 className="pack-selection-title">CHOOSE QUESTION PACK</h2>
      <p className="pack-selection-subject">Subject: {subject.toUpperCase()}</p>
      
      <div className="packs-options">
        <div className="existing-packs-section">
          <h3 className="section-title">EXISTING PACKS</h3>
          {savedPacks.length === 0 ? (
            <div className="no-packs-message">
              <p>No saved packs found.</p>
              <p>Create your first question pack!</p>
            </div>
          ) : (
            <div className="packs-list">
              {savedPacks.map((pack) => (
                <div
                  key={pack.id}
                  className={`pack-item ${selectedPack === pack.id ? 'selected' : ''}`}
                  onClick={() => handleSelectPack(pack)}
                >
                  <div className="pack-item-info">
                    <span className="pack-name">{pack.packName}</span>
                    <span className="pack-questions-count">
                      {pack.questionCount || 0}/19 questions
                    </span>
                    <span className="pack-date">
                      Created: {new Date(pack.createdAt?.toDate()).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="select-pack-button">SELECT</button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="create-new-section">
          <button onClick={handleCreateNew} className="create-new-pack-button">
            + CREATE NEW QUESTION PACK
          </button>
          <p className="create-new-note">Start fresh with a brand new set of 19 questions</p>
        </div>
      </div>
    </div>
  );
}

export default PackSelection;