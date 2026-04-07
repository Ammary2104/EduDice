import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./DiceGame.css";

function DiceGame({ user, subject, pack, onReturnToSubjects, onGameComplete }) {
  const [playerName] = useState(user?.displayName || "Player");
  const [currentPosition, setCurrentPosition] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [message, setMessage] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerMessage, setAnswerMessage] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [showLoseScreen, setShowLoseScreen] = useState(false);
  const [winMessage, setWinMessage] = useState("");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [failedQuestions, setFailedQuestions] = useState([]);

  // Load custom questions from Firebase for the selected pack only
  useEffect(() => {
    const loadCustomQuestions = async () => {
      try {
        let q;
        
        if (pack && pack.id) {
          q = query(
            collection(db, "customQuestions"),
            where("packId", "==", pack.id)
          );
        } else {
          q = query(
            collection(db, "customQuestions"),
            where("userId", "==", user.uid),
            where("subject", "==", subject)
          );
        }
        
        const querySnapshot = await getDocs(q);
        const questionsList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.square) {
            questionsList.push({
              id: doc.id,
              ...data
            });
          }
        });
        
        // Remove duplicates by square number
        const uniqueQuestions = [];
        const squareMap = {};
        
        questionsList.forEach(question => {
          if (!squareMap[question.square]) {
            squareMap[question.square] = true;
            uniqueQuestions.push(question);
          }
        });
        
        setCustomQuestions(uniqueQuestions);
        setAvailableQuestions(uniqueQuestions);
        setLoading(false);
        
        if (uniqueQuestions.length !== 19) {
          alert(`You have ${uniqueQuestions.length}/19 questions. Please complete all 19 questions before playing.`);
          onReturnToSubjects();
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        setLoading(false);
      }
    };
    
    loadCustomQuestions();
  }, [user, subject, pack, onReturnToSubjects]);

  // Check win and lose conditions
  useEffect(() => {
    // Win: Answer all 19 questions correctly
    if (questionsAnswered >= 19) {
      setWinMessage("CONGRATULATIONS! You've answered all 19 questions correctly!");
      setShowWinScreen(true);
    }
    // Lose: Failed to answer all questions and rounds completed reached 6
    else if (roundsCompleted >= 6 && questionsAnswered < 19) {
      setShowLoseScreen(true);
    }
  }, [questionsAnswered, roundsCompleted]);

  const getRandomQuestion = () => {
    const unanswered = availableQuestions.filter(
      q => !answeredQuestions.includes(q.square)
    );
    
    if (unanswered.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * unanswered.length);
    return unanswered[randomIndex];
  };

  const rollDice = () => {
    if (showQuestion || isRolling || loading || showWinScreen || showLoseScreen) return;
    
    setIsRolling(true);
    setDiceValue(null);
    
    let rollCount = 0;
    const maxRolls = 10;
    const interval = setInterval(() => {
      const randomRoll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(randomRoll);
      rollCount++;
      
      if (rollCount >= maxRolls) {
        clearInterval(interval);
        
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        
        let newPos = currentPosition + finalRoll;
        let roundsIncrease = 0;
        
        if (newPos > 19) {
          roundsIncrease = Math.floor(newPos / 19);
          newPos = newPos % 19;
          if (newPos === 0) newPos = 19;
        }
        
        setCurrentPosition(newPos);
        
        if (roundsIncrease > 0) {
          setRoundsCompleted(prev => prev + roundsIncrease);
        }

        const randomQuestion = getRandomQuestion();
        
        if (randomQuestion) {
          setCurrentQuestion(randomQuestion);
          setCurrentQuestionNumber(questionsAnswered + 1);
          setMessage(`Landed on square ${newPos}! Here's a random question!`);
          setAnswerMessage("");
          setSelectedAnswer(null);
          setQuestionAnswered(false);
          
          setTimeout(() => {
            setShowQuestion(true);
            setTimeout(() => {
              setShowPopup(true);
            }, 50);
          }, 300);
        } else if (questionsAnswered >= 19) {
          setWinMessage("CONGRATULATIONS! You've answered all 19 questions correctly!");
          setShowWinScreen(true);
        } else {
          setMessage("No more questions available!");
        }
        
        setIsRolling(false);
      }
    }, 100);
  };

  const handleAnswer = (index) => {
    if (questionAnswered || !currentQuestion) return;
    
    setSelectedAnswer(index);
    setQuestionAnswered(true);
    
    if (index === currentQuestion.correctIndex) {
      setAnsweredQuestions(prev => [...prev, currentQuestion.square]);
      setQuestionsAnswered(prev => prev + 1);
      setAnswerMessage("✓ Correct!");
    } else {
      setFailedQuestions(prev => [...prev, currentQuestion.square]);
      setAnswerMessage("✗ Incorrect. You'll get another chance later!");
    }
  };

  const closeQuestion = () => {
    if (questionAnswered) {
      setShowPopup(false);
      setTimeout(() => {
        setShowQuestion(false);
        setCurrentQuestion(null);
        setMessage("Roll the dice to continue");
      }, 300);
    }
  };

  const handleQuitClick = () => {
    setShowQuitConfirm(true);
  };

  const handleConfirmQuit = () => {
    setShowQuitConfirm(false);
    onReturnToSubjects();
  };

  const handleCancelQuit = () => {
    setShowQuitConfirm(false);
  };

  const handleWinScreenClose = () => {
    setShowWinScreen(false);
    if (onGameComplete) {
      onGameComplete();
    } else {
      onReturnToSubjects();
    }
  };

  const handleLoseScreenClose = () => {
    setShowLoseScreen(false);
    if (onGameComplete) {
      onGameComplete();
    } else {
      onReturnToSubjects();
    }
  };

  const getSquareColor = (num) => {
    if (num === 0) return "start-square";
    return num % 2 === 1 ? "square-odd" : "square-even";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your questions...</p>
      </div>
    );
  }

  const packName = pack?.packName || "Custom Questions";

  return (
    <div className="game-container">
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="player-name">{playerName}</span>
          <span className="subject-badge">{subject.toUpperCase()}</span>
          <span className="pack-badge">{packName}</span>
          <span className="question-counter">Question #{currentQuestionNumber}</span>
          <span className="round-counter">Round #{roundsCompleted + 1}</span>
        </div>
        <div className="top-bar-right">
          <div className="progress-display">
            <span className="progress-item">Questions: {questionsAnswered}/19</span>
            <span className="progress-item">Rounds: {roundsCompleted}/6</span>
          </div>
          <button onClick={handleQuitClick} className="quit-button">
            QUIT GAME
          </button>
        </div>
      </div>

      <div className="board">
        {/* Board layout remains the same */}
        <div className="board-row">
          <div className={`square ${getSquareColor(15)}`}>
            {currentPosition === 15 ? "●" : "15"}
          </div>
          <div className={`square ${getSquareColor(14)}`}>
            {currentPosition === 14 ? "●" : "14"}
          </div>
          <div className={`square ${getSquareColor(13)}`}>
            {currentPosition === 13 ? "●" : "13"}
          </div>
          <div className={`square ${getSquareColor(12)}`}>
            {currentPosition === 12 ? "●" : "12"}
          </div>
          <div className={`square ${getSquareColor(11)}`}>
            {currentPosition === 11 ? "●" : "11"}
          </div>
          <div className={`square ${getSquareColor(10)}`}>
            {currentPosition === 10 ? "●" : "10"}
          </div>
        </div>

        <div className="board-row">
          <div className={`square ${getSquareColor(16)}`}>
            {currentPosition === 16 ? "●" : "16"}
          </div>
          <div className="empty-squares"></div>
          <div className={`square ${getSquareColor(9)}`}>
            {currentPosition === 9 ? "●" : "9"}
          </div>
        </div>

        <div className="board-row">
          <div className={`square ${getSquareColor(17)}`}>
            {currentPosition === 17 ? "●" : "17"}
          </div>
          <div className="empty-squares"></div>
          <div className={`square ${getSquareColor(8)}`}>
            {currentPosition === 8 ? "●" : "8"}
          </div>
        </div>

        <div className="board-row edu-row">
          <div className={`square ${getSquareColor(18)}`}>
            {currentPosition === 18 ? "●" : "18"}
          </div>
          <div className="edu-label">EduDice</div>
          <div className={`square ${getSquareColor(7)}`}>
            {currentPosition === 7 ? "●" : "7"}
          </div>
        </div>

        <div className="board-row">
          <div className={`square ${getSquareColor(19)}`}>
            {currentPosition === 19 ? "●" : "19"}
          </div>
          <div className="empty-squares"></div>
          <div className={`square ${getSquareColor(6)}`}>
            {currentPosition === 6 ? "●" : "6"}
          </div>
        </div>

        <div className="board-row start-row">
          <div className="square start-square">
            {currentPosition === 0 ? "●" : "START"}
          </div>
          <div className={`square ${getSquareColor(1)}`}>
            {currentPosition === 1 ? "●" : "1"}
          </div>
          <div className={`square ${getSquareColor(2)}`}>
            {currentPosition === 2 ? "●" : "2"}
          </div>
          <div className={`square ${getSquareColor(3)}`}>
            {currentPosition === 3 ? "●" : "3"}
          </div>
          <div className={`square ${getSquareColor(4)}`}>
            {currentPosition === 4 ? "●" : "4"}
          </div>
          <div className={`square ${getSquareColor(5)}`}>
            {currentPosition === 5 ? "●" : "5"}
          </div>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Questions Answered:</span>
          <span className="stat-value">{questionsAnswered}/19</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Rounds Completed:</span>
          <span className="stat-value">{roundsCompleted}/6</span>
        </div>
      </div>

      <div className="dice-area">
        <button 
          className={`dice-button ${(showQuestion || isRolling || showWinScreen || showLoseScreen) ? 'disabled' : ''} ${isRolling ? 'blinking' : ''}`} 
          onClick={rollDice}
          disabled={showQuestion || isRolling || showWinScreen || showLoseScreen}
        >
          🎲 {diceValue !== null ? diceValue : ""}
        </button>
        <div className="dice-message">{message}</div>
      </div>

      {showQuestion && currentQuestion && (
        <div className={`question-overlay ${showPopup ? 'visible' : ''}`}>
          <div className={`question-popup ${showPopup ? 'popup-visible' : ''}`}>
            <div className="question-header">QUESTION</div>
            <div className="question-number">
              QUESTION {currentQuestionNumber} • {subject.toUpperCase()}
            </div>
            <div className="question-text">{currentQuestion.question}</div>
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    questionAnswered && index === currentQuestion.correctIndex 
                      ? "correct-option" 
                      : questionAnswered && index === selectedAnswer && index !== currentQuestion.correctIndex
                      ? "wrong-option"
                      : ""
                  }`}
                  onClick={() => handleAnswer(index)}
                  disabled={questionAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
            {answerMessage && (
              <div className={`answer-message ${answerMessage.includes('✓') ? 'correct-message' : 'wrong-message'}`}>
                {answerMessage}
              </div>
            )}
            {questionAnswered && (
              <button className="continue-button" onClick={closeQuestion}>
                Continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Win Screen */}
      {showWinScreen && (
        <div className="win-overlay">
          <div className="win-popup">
            <div className="win-icon">🏆</div>
            <div className="win-header">YOU WIN!</div>
            <div className="win-message">{winMessage}</div>
            <div className="win-stats">
              <div className="win-stat">Questions Answered: {questionsAnswered}/19</div>
              <div className="win-stat">Rounds Completed: {roundsCompleted}/6</div>
            </div>
            <button onClick={handleWinScreenClose} className="win-button">
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Lose Screen */}
      {showLoseScreen && (
        <div className="lose-overlay">
          <div className="lose-popup">
            <div className="lose-icon">😢</div>
            <div className="lose-header">YOU LOSE!</div>
            <div className="lose-message">You completed 6 rounds but only answered {questionsAnswered}/19 questions correctly.</div>
            <div className="lose-stats">
              <div className="lose-stat">Questions Answered: {questionsAnswered}/19</div>
              <div className="lose-stat">Rounds Completed: {roundsCompleted}/6</div>
              <div className="lose-stat">Questions Failed: {19 - questionsAnswered}</div>
            </div>
            <button onClick={handleLoseScreenClose} className="lose-button">
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Quit Game Confirmation Modal */}
      {showQuitConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-popup">
            <div className="confirm-header">QUIT GAME</div>
            <div className="confirm-message">Are you sure you want to quit? Your progress will be lost.</div>
            <div className="confirm-buttons">
              <button onClick={handleCancelQuit} className="confirm-cancel-button">
                CANCEL
              </button>
              <button onClick={handleConfirmQuit} className="confirm-quit-button">
                QUIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiceGame;