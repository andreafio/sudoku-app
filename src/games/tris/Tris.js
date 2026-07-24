import React, { useState, useEffect } from 'react';
import './Tris.css';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const DIFFICULTIES = [
  { key: 'facile', label: 'Facile' },
  { key: 'medio', label: 'Medio' },
  { key: 'esperto', label: 'Esperto' },
];

const getWinner = (cells) => {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { player: cells[a], line: [a, b, c] };
    }
  }
  return null;
};

// random legal move
const randomChoice = (cells) => {
  const free = cells.map((v, i) => (v ? null : i)).filter(i => i !== null);
  return free.length ? free[Math.floor(Math.random() * free.length)] : null;
};

// win if possible, otherwise block, otherwise center/corner/random
const heuristicChoice = (cells) => {
  const free = cells.map((v, i) => (v ? null : i)).filter(i => i !== null);
  if (free.length === 0) return null;
  for (const mark of ['O', 'X']) {
    for (const i of free) {
      const test = [...cells];
      test[i] = mark;
      if (getWinner(test)) return i;
    }
  }
  if (cells[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter(i => cells[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return free[Math.floor(Math.random() * free.length)];
};

// perfect play via minimax
const minimax = (cells, mark) => {
  const winner = getWinner(cells);
  if (winner) return { score: winner.player === 'O' ? 10 : -10 };
  if (cells.every(Boolean)) return { score: 0 };

  const free = cells.map((v, i) => (v ? null : i)).filter(i => i !== null);
  const results = free.map(i => {
    const next = [...cells];
    next[i] = mark;
    const { score } = minimax(next, mark === 'O' ? 'X' : 'O');
    return { i, score };
  });

  return mark === 'O'
    ? results.reduce((best, r) => (r.score > best.score ? r : best))
    : results.reduce((best, r) => (r.score < best.score ? r : best));
};

const minimaxChoice = (cells) => {
  if (cells.every(v => !v)) return 4; // fast-path: start in the center
  const { i } = minimax(cells, 'O');
  return i;
};

const cpuChoiceFor = (level, cells) => {
  if (level === 'facile') return randomChoice(cells);
  if (level === 'esperto') return minimaxChoice(cells);
  return heuristicChoice(cells);
};

const Tris = () => {
  const [cells, setCells] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState('cpu');
  const [level, setLevel] = useState('medio');

  const winner = getWinner(cells);
  const isDraw = !winner && cells.every(Boolean);
  const cpuTurn = mode === 'cpu' && !xIsNext && !winner && !isDraw;

  useEffect(() => {
    if (!cpuTurn) return;
    const timer = setTimeout(() => {
      setCells(prev => {
        if (getWinner(prev) || prev.every(Boolean)) return prev;
        const i = cpuChoiceFor(level, prev);
        if (i === null) return prev;
        const next = [...prev];
        next[i] = 'O';
        return next;
      });
      setXIsNext(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [cpuTurn, level]);

  const newGame = (nextMode = mode, nextLevel = level) => {
    setCells(Array(9).fill(null));
    setXIsNext(true);
    setMode(nextMode);
    setLevel(nextLevel);
  };

  const handleClick = (i) => {
    if (cells[i] || winner || cpuTurn) return;
    const next = [...cells];
    next[i] = xIsNext ? 'X' : 'O';
    setCells(next);
    setXIsNext(!xIsNext);
  };

  let status;
  if (winner) status = `Vince ${winner.player}! 🎉`;
  else if (isDraw) status = 'Pareggio!';
  else if (cpuTurn) status = 'Il computer pensa…';
  else status = `Tocca a ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="tris">
      <div className="mode-picker">
        <button
          className={`mode-pill ${mode === 'cpu' ? 'active' : ''}`}
          onClick={() => newGame('cpu')}
        >
          vs Computer
        </button>
        <button
          className={`mode-pill ${mode === 'pvp' ? 'active' : ''}`}
          onClick={() => newGame('pvp')}
        >
          2 Giocatori
        </button>
      </div>

      {mode === 'cpu' && (
        <div className="difficulty-picker">
          {DIFFICULTIES.map(d => (
            <button
              key={d.key}
              className={`difficulty-pill difficulty-${d.key} ${level === d.key ? 'active' : ''}`}
              onClick={() => newGame('cpu', d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      <div className={`tris-status ${winner ? 'won' : ''}`}>{status}</div>

      <div className="tris-board">
        {cells.map((v, i) => (
          <button
            key={i}
            className={`tris-cell ${v ? `mark-${v.toLowerCase()}` : ''} ${winner?.line.includes(i) ? 'win' : ''}`}
            onClick={() => handleClick(i)}
          >
            {v}
          </button>
        ))}
      </div>

      <button className="reset-btn" onClick={() => newGame()}>Nuova Partita</button>
    </div>
  );
};

export default Tris;
