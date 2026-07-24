import React, { useState, useEffect, useCallback } from 'react';
import './Game2048.css';

const SIZE = 4;

const emptyBoard = () => Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));

const addRandomTile = (board) => {
  const empty = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empty.push([r, c]); }));
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return board;
};

const slideRowLeft = (row) => {
  const vals = row.filter(v => v !== 0);
  const out = [];
  let gained = 0;
  for (let i = 0; i < vals.length; i++) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      out.push(vals[i] * 2);
      gained += vals[i] * 2;
      i++;
    } else {
      out.push(vals[i]);
    }
  }
  while (out.length < SIZE) out.push(0);
  return [out, gained];
};

const transpose = (b) => b[0].map((_, c) => b.map(row => row[c]));
const reverseRows = (b) => b.map(row => [...row].reverse());

const moveBoard = (board, dir) => {
  let b = board.map(row => [...row]);
  if (dir === 'up') b = transpose(b);
  if (dir === 'down') b = reverseRows(transpose(b));
  if (dir === 'right') b = reverseRows(b);
  let gained = 0;
  b = b.map(row => {
    const [newRow, g] = slideRowLeft(row);
    gained += g;
    return newRow;
  });
  if (dir === 'up') b = transpose(b);
  if (dir === 'down') b = transpose(reverseRows(b));
  if (dir === 'right') b = reverseRows(b);
  const moved = JSON.stringify(b) !== JSON.stringify(board);
  return [b, gained, moved];
};

const canMove = (b) => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (b[r][c] === 0) return true;
      if (c + 1 < SIZE && b[r][c] === b[r][c + 1]) return true;
      if (r + 1 < SIZE && b[r][c] === b[r + 1][c]) return true;
    }
  }
  return false;
};

const newGameState = () => ({
  board: addRandomTile(addRandomTile(emptyBoard())),
  score: 0,
  over: false,
});

const Game2048 = () => {
  const [state, setState] = useState(newGameState);

  const doMove = useCallback((dir) => {
    setState(s => {
      if (s.over) return s;
      const [board, gained, moved] = moveBoard(s.board, dir);
      if (!moved) return s;
      addRandomTile(board);
      return { board, score: s.score + gained, over: !canMove(board) };
    });
  }, []);

  useEffect(() => {
    const KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    const onKey = (e) => {
      if (KEYS[e.key]) {
        e.preventDefault();
        doMove(KEYS[e.key]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doMove]);

  const won = state.board.some(row => row.some(v => v >= 2048));

  return (
    <div className="g2048">
      <div className="g2048-topbar">
        <div className="g2048-score">Punteggio<strong>{state.score}</strong></div>
        {state.over && <div className="g2048-badge g2048-lost">Nessuna mossa!</div>}
        {!state.over && won && <div className="g2048-badge g2048-won">2048! 🎉</div>}
      </div>

      <div className="g2048-board">
        {state.board.map((row, r) => (
          <div key={r} className="g2048-row">
            {row.map((v, c) => (
              <div key={c} className="g2048-tile" data-value={v || undefined}>
                {v !== 0 ? v : ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="g2048-controls">
        <button onClick={() => doMove('up')} aria-label="Su">↑</button>
        <div>
          <button onClick={() => doMove('left')} aria-label="Sinistra">←</button>
          <button onClick={() => doMove('down')} aria-label="Giù">↓</button>
          <button onClick={() => doMove('right')} aria-label="Destra">→</button>
        </div>
      </div>

      <button className="reset-btn" onClick={() => setState(newGameState())}>Nuova Partita</button>
      <p className="g2048-hint">Usa le frecce della tastiera o i pulsanti</p>
    </div>
  );
};

export default Game2048;
