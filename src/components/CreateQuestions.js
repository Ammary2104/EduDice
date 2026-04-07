import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "./CreateQuestions.css";

function CreateQuestions({ user, subject, pack, onComplete, onBack, onLogout }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    square: 1,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [existingQuestions, setExistingQuestions] = useState({});
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [packName, setPackName] = useState(pack?.packName || "");
  const [showSavePackModal, setShowSavePackModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPack, setCurrentPack] = useState(pack);
  const [isNewPack, setIsNewPack] = useState(!pack);
  const [isEditingPackName, setIsEditingPackName] = useState(false);
  const [isPackSaved, setIsPackSaved] = useState(false);

  // Load existing questions for current pack
  useEffect(() => {
    if (currentPack && currentPack.id) {
      const loadPackQuestions = async () => {
        try {
          const q = query(
            collection(db, "customQuestions"),
            where("packId", "==", currentPack.id)
          );
          
          const querySnapshot = await getDocs(q);
          const questionsMap = {};
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            questionsMap[data.square] = {
              id: doc.id,
              ...data
            };
          });
          
          setExistingQuestions(questionsMap);
          
          // Check if pack is saved (has been created in Firebase)
          setIsPackSaved(true);
          
          // Load first question
          if (Object.keys(questionsMap).length > 0) {
            const firstSquare = Math.min(...Object.keys(questionsMap).map(Number));
            setCurrentQuestion(questionsMap[firstSquare]);
          }
        } catch (error) {
          console.error("Error loading pack questions:", error);
        }
      };
      
      loadPackQuestions();
    } else {
      setIsPackSaved(false);
    }
  }, [currentPack]);

  // Set pack name when pack changes
  useEffect(() => {
    if (pack) {
      setPackName(pack.packName);
      setCurrentPack(pack);
      setIsNewPack(false);
      setIsPackSaved(true);
    }
  }, [pack]);

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      question: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleCorrectChange = (index) => {
    setCurrentQuestion({
      ...currentQuestion,
      correctIndex: index
    });
  };

  const handleSquareChange = (square) => {
    // Save current question before switching
    if (currentQuestion.question || currentQuestion.options.some(opt => opt)) {
      saveCurrentQuestion();
    }
    
    // Load existing question for this square if available
    if (existingQuestions[square]) {
      setCurrentQuestion(existingQuestions[square]);
    } else {
      setCurrentQuestion({
        square,
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0
      });
    }
  };

  const saveCurrentQuestion = async () => {
    if (!currentPack) {
      setMessage("Please save your pack first");
      return false;
    }
    
    // Validate
    if (!currentQuestion.question.trim()) {
      setMessage("Please enter a question");
      return false;
    }
    
    if (currentQuestion.options.some(opt => !opt.trim())) {
      setMessage("Please fill in all options");
      return false;
    }
    
    setSaving(true);
    setMessage("");
    
    try {
      const questionData = {
        userId: user.uid,
        subject,
        packId: currentPack.id,
        square: currentQuestion.square,
        question: currentQuestion.question.trim(),
        options: currentQuestion.options.map(opt => opt.trim()),
        correctIndex: currentQuestion.correctIndex,
        createdAt: new Date()
      };
      
      // If this square already has a question, delete it first
      if (existingQuestions[currentQuestion.square]) {
        await deleteDoc(doc(db, "customQuestions", existingQuestions[currentQuestion.square].id));
      }
      
      // Save new question
      const docRef = await addDoc(collection(db, "customQuestions"), questionData);
      
      // Update local state
      setExistingQuestions({
        ...existingQuestions,
        [currentQuestion.square]: {
          id: docRef.id,
          ...questionData
        }
      });
      
      setMessage(`Question ${currentQuestion.square} saved!`);
      return true;
    } catch (error) {
      console.error("Error saving question:", error);
      setMessage("Error saving question. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePackName = async () => {
    if (!packName.trim()) {
      setMessage("Please enter a pack name");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (currentPack && currentPack.id) {
        // Update existing pack name
        const packRef = doc(db, "questionPacks", currentPack.id);
        await updateDoc(packRef, {
          packName: packName.trim(),
          updatedAt: new Date()
        });
        
        setCurrentPack({
          ...currentPack,
          packName: packName.trim()
        });
        
        setMessage("Pack name updated successfully!");
        setIsEditingPackName(false);
        
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating pack name:", error);
      setMessage("Error updating pack name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePack = async () => {
    if (!packName.trim()) {
      setMessage("Please enter a pack name");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let packId = currentPack?.id;
      
      // If this is a new pack, create it first
      if (!packId) {
        const packData = {
          userId: user.uid,
          subject,
          packName: packName.trim(),
          createdAt: new Date(),
          questionCount: Object.keys(existingQuestions).length
        };
        
        const packRef = await addDoc(collection(db, "questionPacks"), packData);
        packId = packRef.id;
        setCurrentPack({ id: packId, ...packData });
        setIsNewPack(false);
        setIsPackSaved(true);
      } else {
        // Update existing pack's question count
        const packRef = doc(db, "questionPacks", currentPack.id);
        await updateDoc(packRef, {
          questionCount: Object.keys(existingQuestions).length,
          updatedAt: new Date()
        });
        setIsPackSaved(true);
      }
      
      // Save all questions that haven't been saved yet
      for (const [square, question] of Object.entries(existingQuestions)) {
        if (!question.id) {
          const questionData = {
            userId: user.uid,
            subject,
            packId: packId,
            square: parseInt(square),
            question: question.question,
            options: question.options,
            correctIndex: question.correctIndex,
            createdAt: new Date()
          };
          
          await addDoc(collection(db, "customQuestions"), questionData);
        }
      }
      
      setShowSavePackModal(false);
      setMessage("Pack saved successfully!");
      
      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error saving pack:", error);
      setMessage("Error saving pack. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    // Save current question first
    const saved = await saveCurrentQuestion();
    if (!saved) return;
    
    // Check if all 19 squares have questions
    const savedCount = Object.keys(existingQuestions).length;
    if (savedCount < 19) {
      setMessage(`You have saved ${savedCount}/19 questions. Please complete all squares.`);
      return;
    }
    
    setMessage("All questions saved! You can now start the game.");
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const handleBackClick = () => {
    const hasUnsaved = currentQuestion.question.trim() || 
                       currentQuestion.options.some(opt => opt.trim());
    
    if (hasUnsaved && !existingQuestions[currentQuestion.square]) {
      setShowBackConfirm(true);
    } else {
      onBack();
    }
  };

  const handleConfirmBack = () => {
    setShowBackConfirm(false);
    onBack();
  };

  const handleCancelBack = () => {
    setShowBackConfirm(false);
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

  const squares = Array.from({ length: 19 }, (_, i) => i + 1);
  const savedCount = Object.keys(existingQuestions).length;
  const hasAllQuestions = savedCount === 19;

  return (
    <div className="create-questions-container">
      <div className="create-questions-header">
        <div className="header-top">
          <button onClick={handleBackClick} className="back-button">
            ← BACK
          </button>
          <h1 className="create-questions-logo">EDUDICE</h1>
          <button onClick={handleLogoutClick} className="logout-button">
            LOGOUT
          </button>
        </div>
        <h2 className="create-questions-title">CREATE YOUR QUESTIONS</h2>
        <p className="create-questions-subject">Subject: {subject.toUpperCase()}</p>
      </div>
      
      <div className="pack-info-bar">
        <div className="current-pack-info">
          <span className="pack-label">Current Pack:</span>
          {isEditingPackName ? (
            <div className="edit-pack-name">
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                className="pack-name-input-inline"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdatePackName();
                  }
                }}
              />
              <button onClick={handleUpdatePackName} className="save-name-button" disabled={isLoading}>
                SAVE
              </button>
              <button onClick={() => {
                setIsEditingPackName(false);
                setPackName(currentPack?.packName || "");
              }} className="cancel-name-button">
                CANCEL
              </button>
            </div>
          ) : (
            <>
              <span className="pack-name">{currentPack?.packName || "Untitled Pack"}</span>
              {/* Only show EDIT button if pack is saved */}
              {isPackSaved && (
                <button onClick={() => setIsEditingPackName(true)} className="edit-name-button">
                  ✎ EDIT
                </button>
              )}
            </>
          )}
          {isNewPack && <span className="new-badge">NEW</span>}
        </div>
        {/* Only show SAVE PACK button if pack is NOT saved yet */}
        {!isPackSaved && (
          <button onClick={() => setShowSavePackModal(true)} className="save-pack-button">
            SAVE PACK
          </button>
        )}
      </div>
      
      <div className="questions-layout">
        <div className="squares-sidebar">
          <h3>SQUARES</h3>
          <div className="squares-grid">
            {squares.map((square) => (
              <div
                key={square}
                className={`square-button ${existingQuestions[square] ? 'saved' : ''} ${currentQuestion.square === square ? 'active' : ''}`}
                onClick={() => handleSquareChange(square)}
              >
                {square}
                {existingQuestions[square] && <span className="saved-indicator">✓</span>}
              </div>
            ))}
          </div>
          <div className="saved-count">
            Saved: {savedCount}/19
          </div>
        </div>
        
        <div className="question-editor">
          <h3>Square {currentQuestion.square}</h3>
          
          <div className="form-group">
            <label>QUESTION:</label>
            <textarea
              value={currentQuestion.question}
              onChange={handleQuestionChange}
              placeholder="Enter your question"
              rows="3"
              className="question-input"
            />
          </div>
          
          <div className="form-group">
            <label>OPTIONS:</label>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="option-row">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="option-input"
                />
                <input
                  type="radio"
                  name="correctOption"
                  checked={currentQuestion.correctIndex === index}
                  onChange={() => handleCorrectChange(index)}
                  className="correct-radio"
                />
                <span className="correct-label">Correct</span>
              </div>
            ))}
          </div>
          
          <div className="editor-actions">
            <button 
              onClick={saveCurrentQuestion} 
              className="save-question-button"
              disabled={saving}
            >
              {saving ? "SAVING..." : "SAVE THIS QUESTION"}
            </button>
          </div>
          
          {message && <p className="editor-message">{message}</p>}
        </div>
      </div>
      
      <div className="create-questions-actions">
        <button onClick={handleSaveAll} className="complete-button">
          SAVE ALL & CONTINUE TO GAME
        </button>
      </div>

      {/* Save Pack Modal */}
      {showSavePackModal && (
        <div className="confirm-overlay">
          <div className="confirm-popup">
            <div className="confirm-header">SAVE QUESTION PACK</div>
            <div className="confirm-message">
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                placeholder="Enter pack name"
                className="pack-name-input"
                autoFocus
              />
              <p className="save-note">Questions saved: {savedCount}/19</p>
            </div>
            <div className="confirm-buttons">
              <button onClick={() => setShowSavePackModal(false)} className="confirm-cancel-button">
                CANCEL
              </button>
              <button onClick={handleSavePack} className="confirm-save-button" disabled={isLoading}>
                {isLoading ? "SAVING..." : "SAVE PACK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Confirmation Modal */}
      {showBackConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-popup">
            <div className="confirm-header">UNSAVED CHANGES</div>
            <div className="confirm-message">
              You have unsaved changes for Square {currentQuestion.square}. 
              Are you sure you want to go back? Your changes will be lost.
            </div>
            <div className="confirm-buttons">
              <button onClick={handleCancelBack} className="confirm-cancel-button">
                STAY
              </button>
              <button onClick={handleConfirmBack} className="confirm-back-button">
                LEAVE
              </button>
            </div>
          </div>
        </div>
      )}

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

export default CreateQuestions;