import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Game2048.css';

const DIFFICULTIES = [
  { key: 'facile', label: 'Facile', size: 5 },
  { key: 'medio', label: 'Medio', size: 4 },
  { key: 'difficile', label: 'Difficile', size: 3 },
];

const emptyBoard = (size) => Array(size).fill(null).map(() => Array(size).fill(0));

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
  while (out.length < row.length) out.push(0);
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
  const size = b.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (b[r][c] === 0) return true;
      if (c + 1 < size && b[r][c] === b[r][c + 1]) return true;
      if (r + 1 < size && b[r][c] === b[r + 1][c]) return true;
    }
  }
  return false;
};

const hasReached2048 = (b) => b.some(row => row.some(v => v >= 2048));

// AI: try all 4 directions, play whichever gains the most (ties broken randomly)
const bestAiMove = (board) => {
  const dirs = ['left', 'right', 'up', 'down'];
  const options = dirs
    .map(dir => ({ dir, result: moveBoard(board, dir) }))
    .filter(o => o.result[2]);
  if (options.length === 0) return null;
  const maxGain = Math.max(...options.map(o => o.result[1]));
  const best = options.filter(o => o.result[1] === maxGain);
  return best[Math.floor(Math.random() * best.length)].result[0];
};

const newSolo = (size) => ({
  board: addRandomTile(addRandomTile(emptyBoard(size))),
  score: 0,
  over: false,
});

const Game2048 = () => {
  const [difficulty, setDifficulty] = useState('medio');
  const [mode, setMode] = useState('solitario');
  const [player, setPlayer] = useState(() => newSolo(4));
  const [ai, setAi] = useState(() => newSolo(4));
  const [winner, setWinner] = useState(null); // 'player' | 'ai' | 'draw' | null

  const winnerRef = useRef(null);
  const aiOverRef = useRef(false);
  const touchStartRef = useRef(null);
  useEffect(() => { winnerRef.current = winner; }, [winner]);
  useEffect(() => { aiOverRef.current = ai.over; }, [ai.over]);

  const size = DIFFICULTIES.find(d => d.key === difficulty).size;

  const startGame = useCallback((diffKey = difficulty, nextMode = mode) => {
    const nextSize = DIFFICULTIES.find(d => d.key === diffKey).size;
    setDifficulty(diffKey);
    setMode(nextMode);
    setPlayer(newSolo(nextSize));
    setAi(newSolo(nextSize));
    setWinner(null);
  }, [difficulty, mode]);

  const doMove = useCallback((dir) => {
    setPlayer(s => {
      if (s.over || winnerRef.current) return s;
      const [board, gained, moved] = moveBoard(s.board, dir);
      if (!moved) return s;
      addRandomTile(board);
      return { board, score: s.score + gained, over: !canMove(board) };
    });
  }, []);

  useEffect(() => {
    if (hasReached2048(player.board) && !winnerRef.current) setWinner('player');
  }, [player.board]);

  useEffect(() => {
    if (hasReached2048(ai.board) && !winnerRef.current) setWinner('ai');
  }, [ai.board]);

  // AI opponent ticking, only in 'sfida' mode
  useEffect(() => {
    if (mode !== 'sfida') return undefined;
    const timer = setInterval(() => {
      if (winnerRef.current || aiOverRef.current) return;
      setAi(s => {
        if (s.over) return s;
        const board = bestAiMove(s.board);
        if (!board) return { ...s, over: true };
        addRandomTile(board);
        const gained = board.flat().reduce((a, b) => a + b, 0) - s.board.flat().reduce((a, b) => a + b, 0);
        const score = s.score + Math.max(0, gained);
        return { board, score, over: !canMove(board) };
      });
    }, 550);
    return () => clearInterval(timer);
  }, [mode, difficulty]);

  // Decide a duel winner once both boards are stuck, by score
  useEffect(() => {
    if (mode !== 'sfida' || winner) return;
    if (player.over && ai.over) {
      if (player.score === ai.score) setWinner('draw');
      else setWinner(player.score > ai.score ? 'player' : 'ai');
    }
  }, [mode, player.over, ai.over, player.score, ai.score, winner]);

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

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 24) return;
    if (absX > absY) doMove(dx > 0 ? 'right' : 'left');
    else doMove(dy > 0 ? 'down' : 'up');
  };

  const renderBoard = (board, extraClass) => (
    <div className={`g2048-board ${extraClass || ''}`} style={{ '--cols': board.length }}>
      {board.map((row, r) => (
        <div key={r} className="g2048-row">
          {row.map((v, c) => (
            <div key={c} className="g2048-tile" data-value={v || undefined}>
              {v !== 0 ? v : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="g2048">
      <div className="mode-picker">
        <button className={`mode-pill ${mode === 'solitario' ? 'active' : ''}`} onClick={() => startGame(difficulty, 'solitario')}>
          Solitario
        </button>
        <button className={`mode-pill ${mode === 'sfida' ? 'active' : ''}`} onClick={() => startGame(difficulty, 'sfida')}>
          Sfida vs Computer
        </button>
      </div>

      <div className="difficulty-picker">
        {DIFFICULTIES.map(d => (
          <button
            key={d.key}
            className={`difficulty-pill difficulty-${d.key} ${difficulty === d.key ? 'active' : ''}`}
            onClick={() => startGame(d.key, mode)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {winner && (
        <div className={`duel-result ${winner === 'player' ? 'win' : winner === 'draw' ? '' : 'lose'}`}>
          {winner === 'player' && 'Hai vinto tu! 🎉'}
          {winner === 'ai' && 'Ha vinto il computer! 🤖'}
          {winner === 'draw' && 'Pareggio!'}
        </div>
      )}

      <div className="g2048-topbar">
        <div className="g2048-score">Punteggio<strong>{player.score}</strong></div>
        {mode === 'sfida' && <div className="g2048-score">Computer<strong>{ai.score}</strong></div>}
        {mode === 'solitario' && player.over && <div className="g2048-badge g2048-lost">Nessuna mossa!</div>}
      </div>

      <div className={mode === 'sfida' ? 'g2048-duel' : ''}>
        <div className="g2048-swipe-zone" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {renderBoard(player.board)}
        </div>
        {mode === 'sfida' && renderBoard(ai.board, 'g2048-board-mini')}
      </div>

      <div className="g2048-controls">
        <button onClick={() => doMove('up')} aria-label="Su">↑</button>
        <div>
          <button onClick={() => doMove('left')} aria-label="Sinistra">←</button>
          <button onClick={() => doMove('down')} aria-label="Giù">↓</button>
          <button onClick={() => doMove('right')} aria-label="Destra">→</button>
        </div>
      </div>

      <button className="reset-btn" onClick={() => startGame(difficulty, mode)}>Nuova Partita</button>
      <p className="g2048-hint">Scorri sulla griglia, o usa le frecce · griglia {size}x{size}</p>
    </div>
  );
};

export default Game2048;
