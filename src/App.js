import React, { useState } from 'react';
import './App.css';
import GameShell from './components/GameShell';
import Sudoku from './games/sudoku/Sudoku';
import Game2048 from './games/game2048/Game2048';
import Memory from './games/memory/Memory';
import Tris from './games/tris/Tris';
import WordGuess from './games/wordguess/WordGuess';
import Crossword from './games/crossword/Crossword';

const GAMES = [
  { key: 'sudoku', title: 'Sudoku', emoji: '🧩', desc: 'Il classico 9x9 con 4 difficoltà', accent: 'sudoku', Component: Sudoku },
  { key: '2048', title: '2048', emoji: '🔢', desc: 'Unisci le tessere fino a 2048', accent: 'g2048', Component: Game2048 },
  { key: 'memory', title: 'Memory', emoji: '🃏', desc: 'Trova tutte le coppie', accent: 'memory', Component: Memory },
  { key: 'tris', title: 'Tris', emoji: '⭕', desc: 'Tre in fila, anche contro il computer', accent: 'tris', Component: Tris },
  { key: 'wordguess', title: 'Indovina la Parola', emoji: '🔤', desc: 'Wordle in italiano, 6 tentativi', accent: 'wordguess', Component: WordGuess },
  { key: 'crossword', title: 'Cruciverba', emoji: '📰', desc: 'Griglia generata al volo con indizi', accent: 'crossword', Component: Crossword },
];

const App = () => {
  const [activeKey, setActiveKey] = useState(null);
  const active = GAMES.find(g => g.key === activeKey);

  if (active) {
    const Game = active.Component;
    return (
      <div className="App">
        <GameShell title={active.title} onBack={() => setActiveKey(null)}>
          <Game />
        </GameShell>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Sala Giochi</h1>
      <p className="subtitle">Scegli un gioco per iniziare</p>
      <div className="home-grid">
        {GAMES.map(g => (
          <button key={g.key} className={`game-card card-${g.accent}`} onClick={() => setActiveKey(g.key)}>
            <span className="game-emoji" role="img" aria-label={g.title}>{g.emoji}</span>
            <span className="game-title">{g.title}</span>
            <span className="game-desc">{g.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
