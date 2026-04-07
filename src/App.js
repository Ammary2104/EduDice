import React, { useState, useEffect } from "react";
import "./App.css";
import { auth } from "./firebase";
import Signup from "./components/Signup";
import Login from "./components/Login";
import GameMode from "./components/GameMode";
import SubjectSelection from "./components/SubjectSelection";
import PackSelection from "./components/PackSelection";
import CreateQuestions from "./components/CreateQuestions";
import DiceGame from "./components/DiceGame";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  
  // Game flow states
  const [gameScreen, setGameScreen] = useState('mode'); // 'mode', 'subject', 'pack', 'create', 'game'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignupSuccess = (user) => {
    setUser(user);
    setShowLogin(false);
    setGameScreen('mode');
  };

  const handleLoginSuccess = (user) => {
    setUser(user);
    setGameScreen('mode');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      resetGame();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const resetGame = () => {
    setSelectedSubject(null);
    setSelectedPack(null);
    setGameScreen('mode');
  };

  const handleModeSelect = (mode) => {
    if (mode === 'solo') {
      setGameScreen('subject');
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setGameScreen('pack');
  };

  const handleSelectPack = (pack) => {
    setSelectedPack(pack);
    setGameScreen('create');
  };

  const handleCreateNewPack = () => {
    setSelectedPack(null);
    setGameScreen('create');
  };

  const handleBackToSubject = () => {
    setSelectedSubject(null);
    setSelectedPack(null);
    setGameScreen('subject');
  };

  const handleBackToPack = () => {
    setSelectedPack(null);
    setGameScreen('pack');
  };

  const handleQuestionsComplete = () => {
    setGameScreen('game');
  };

  const handleGameComplete = () => {
    setSelectedSubject(null);
    setSelectedPack(null);
    setGameScreen('subject');
  };

  const handleReturnToSubjects = () => {
    setSelectedSubject(null);
    setSelectedPack(null);
    setGameScreen('subject');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        <>
          {showLogin ? (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onSwitchToSignup={() => setShowLogin(false)}
            />
          ) : (
            <Signup 
              onSignupSuccess={handleSignupSuccess} 
              onSwitchToLogin={() => setShowLogin(true)}
            />
          )}
        </>
      ) : (
        <>
          {gameScreen === 'mode' && (
            <GameMode 
              onSelectMode={handleModeSelect}
              onLogout={handleLogout}
              user={user}
            />
          )}

          {gameScreen === 'subject' && (
            <SubjectSelection 
              onSelectSubject={handleSubjectSelect}
              onLogout={handleLogout}
              user={user}
            />
          )}

          {gameScreen === 'pack' && (
            <PackSelection 
              user={user}
              subject={selectedSubject}
              onSelectPack={handleSelectPack}
              onCreateNewPack={handleCreateNewPack}
              onBack={handleBackToSubject}
            />
          )}

          {gameScreen === 'create' && (
            <CreateQuestions 
              user={user}
              subject={selectedSubject}
              pack={selectedPack}
              onComplete={handleQuestionsComplete}
              onBack={handleBackToPack}
              onLogout={handleLogout}
            />
          )}

          {gameScreen === 'game' && (
            <DiceGame 
              user={user} 
              subject={selectedSubject}
              pack={selectedPack}
              onLogout={handleLogout}
              onReturnToSubjects={handleReturnToSubjects}
              onGameComplete={handleGameComplete}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;