const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let gameState = {
  playerName: 'Player name..',
  score: 12,
  currentPosition: 19
};

app.get('/api/game', (req, res) => {
  res.json(gameState);
});

app.post('/api/roll-dice', (req, res) => {
  const diceValue = Math.floor(Math.random() * 6) + 1;
  let newPosition = gameState.currentPosition + diceValue;
  
  if (newPosition > 19) {
    newPosition = newPosition - 19;
  }
  
  gameState.currentPosition = newPosition;
  
  res.json({
    diceValue,
    newPosition
  });
});

app.post('/api/update-score', (req, res) => {
  gameState.score = gameState.score + 1;
  res.json({ score: gameState.score });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});