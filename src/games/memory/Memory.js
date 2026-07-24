import React, { useState, useRef, useEffect } from 'react';
import './Memory.css';

const EMOJI_POOL = ['🐶', '🦊', '🐼', '🐸', '🦄', '🐙', '🦋', '🍉', '🍕', '⚽', '🎧', '🚀'];

const DIFFICULTIES = [
  { key: 'facile', label: 'Facile', pairs: 6, cols: 3, aiMemoryChance: 0.35 },
  { key: 'medio', label: 'Medio', pairs: 8, cols: 4, aiMemoryChance: 0.6 },
  { key: 'difficile', label: 'Difficile', pairs: 10, cols: 4, aiMemoryChance: 0.8 },
  { key: 'esperto', label: 'Esperto', pairs: 12, cols: 4, aiMemoryChance: 1 },
];

const buildDeck = (pairs) => {
  const chosen = EMOJI_POOL.slice(0, pairs);
  return [...chosen, ...chosen]
    .map(emoji => ({ emoji, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ emoji }, id) => ({ id, emoji }));
};

const Memory = () => {
  const [difficulty, setDifficulty] = useState('medio');
  const [mode, setMode] = useState('solitario');
  const [deck, setDeck] = useState(() => buildDeck(DIFFICULTIES[1].pairs));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [turn, setTurn] = useState('player');
  const [locked, setLocked] = useState(false);

  const aiMemory = useRef(new Map()); // id -> emoji, cards the AI "remembers"
  const cancelledRef = useRef(false);
  const timersRef = useRef([]);
  const deckRef = useRef(deck);
  const matchedRef = useRef(matched);

  useEffect(() => { deckRef.current = deck; }, [deck]);
  useEffect(() => { matchedRef.current = matched; }, [matched]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };
  const schedule = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const diffConf = DIFFICULTIES.find(d => d.key === difficulty);
  const won = matched.size === deck.length;

  const remember = (id, emoji) => {
    if (Math.random() < diffConf.aiMemoryChance) aiMemory.current.set(id, emoji);
  };

  const newGame = (nextDiffKey = difficulty, nextMode = mode) => {
    cancelledRef.current = true;
    clearTimers();
    const conf = DIFFICULTIES.find(d => d.key === nextDiffKey);
    const nextDeck = buildDeck(conf.pairs);
    setDifficulty(nextDiffKey);
    setMode(nextMode);
    setDeck(nextDeck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setScores({ player: 0, ai: 0 });
    setTurn('player');
    setLocked(false);
    aiMemory.current = new Map();
    deckRef.current = nextDeck;
    matchedRef.current = new Set();
    cancelledRef.current = false;
  };

  // Resolves a completed pair of flips for either the player or the AI.
  const resolvePair = (ids, who, onDone) => {
    const [a, b] = ids;
    const currentDeck = deckRef.current;
    remember(a, currentDeck[a].emoji);
    remember(b, currentDeck[b].emoji);
    const isMatch = currentDeck[a].emoji === currentDeck[b].emoji;
    if (isMatch) {
      setMatched(prev => {
        const next = new Set([...prev, a, b]);
        matchedRef.current = next;
        return next;
      });
      if (mode === 'sfida') setScores(s => ({ ...s, [who]: s[who] + 1 }));
      setFlipped([]);
      onDone(true);
    } else {
      schedule(() => {
        if (cancelledRef.current) return;
        setFlipped([]);
        onDone(false);
      }, 750);
    }
  };

  const handleFlip = (id) => {
    if (locked || flipped.includes(id) || matched.has(id)) return;
    if (mode === 'sfida' && turn !== 'player') return;

    remember(id, deck[id].emoji);
    const nowFlipped = [...flipped, id];
    setFlipped(nowFlipped);

    if (nowFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      resolvePair(nowFlipped, 'player', (matchedPair) => {
        setLocked(false);
        if (mode === 'sfida' && !matchedPair) setTurn('ai');
      });
    }
  };

  // Turn-based AI opponent: uses remembered cards when it can, otherwise guesses.
  const runAiTurn = () => {
    if (cancelledRef.current) return;
    setLocked(true);
    schedule(() => {
      if (cancelledRef.current) return;
      const currentDeck = deckRef.current;
      const remainingIds = currentDeck.map((_, i) => i).filter(i => !matchedRef.current.has(i));
      if (remainingIds.length === 0) return;

      const knownEntries = [...aiMemory.current.entries()].filter(([id]) => !matchedRef.current.has(id));
      let firstId = null;
      let secondId = null;
      for (const [id, emoji] of knownEntries) {
        const partner = knownEntries.find(([oid, oe]) => oid !== id && oe === emoji);
        if (partner) { firstId = id; secondId = partner[0]; break; }
      }
      if (firstId === null) {
        firstId = remainingIds[Math.floor(Math.random() * remainingIds.length)];
      }

      setFlipped([firstId]);
      remember(firstId, currentDeck[firstId].emoji);

      schedule(() => {
        if (cancelledRef.current) return;
        if (secondId === null) {
          const knownMatch = [...aiMemory.current.entries()]
            .find(([id, emoji]) => id !== firstId && !matchedRef.current.has(id) && emoji === currentDeck[firstId].emoji);
          const pool = remainingIds.filter(i => i !== firstId);
          secondId = knownMatch ? knownMatch[0] : pool[Math.floor(Math.random() * pool.length)];
        }
        const pairIds = [firstId, secondId];
        setFlipped(pairIds);
        setMoves(m => m + 1);

        resolvePair(pairIds, 'ai', (matchedPair) => {
          if (cancelledRef.current) return;
          if (matchedPair && matchedRef.current.size < currentDeck.length) {
            schedule(() => { if (!cancelledRef.current) runAiTurn(); }, 500);
          } else {
            setLocked(false);
            setTurn('player');
          }
        });
      }, 600);
    }, 500);
  };

  const handleModeChange = (nextMode) => newGame(difficulty, nextMode);
  const handleDifficultyChange = (key) => newGame(key, mode);

  useEffect(() => {
    if (mode === 'sfida' && turn === 'ai' && !won) runAiTurn();
    // runAiTurn reads fresh state via refs, so it's intentionally not a dependency here
  }, [turn, mode]); // eslint-disable-line

  useEffect(() => () => { cancelledRef.current = true; clearTimers(); }, []);

  return (
    <div className="memory">
      <div className="mode-picker">
        <button className={`mode-pill ${mode === 'solitario' ? 'active' : ''}`} onClick={() => handleModeChange('solitario')}>
          Solitario
        </button>
        <button className={`mode-pill ${mode === 'sfida' ? 'active' : ''}`} onClick={() => handleModeChange('sfida')}>
          Sfida vs Computer
        </button>
      </div>

      <div className="difficulty-picker">
        {DIFFICULTIES.map(d => (
          <button
            key={d.key}
            className={`difficulty-pill difficulty-${d.key} ${difficulty === d.key ? 'active' : ''}`}
            onClick={() => handleDifficultyChange(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {mode === 'sfida' && won && (
        <div className={`duel-result ${scores.player > scores.ai ? 'win' : scores.player < scores.ai ? 'lose' : ''}`}>
          {scores.player > scores.ai && 'Hai vinto tu! 🎉'}
          {scores.player < scores.ai && 'Ha vinto il computer! 🤖'}
          {scores.player === scores.ai && 'Pareggio!'}
        </div>
      )}

      <div className="memory-topbar">
        <div className="memory-stat">Mosse<strong>{moves}</strong></div>
        {mode === 'solitario' && (
          <div className="memory-stat">Coppie<strong>{matched.size / 2}/{deck.length / 2}</strong></div>
        )}
        {mode === 'sfida' && (
          <>
            <div className="memory-stat">Tu<strong>{scores.player}</strong></div>
            <div className="memory-stat">Computer<strong>{scores.ai}</strong></div>
          </>
        )}
        {mode === 'solitario' && won && <div className="memory-badge">Vittoria! 🎉</div>}
        {mode === 'sfida' && !won && (
          <div className="memory-badge" style={{ background: turn === 'player' ? 'var(--diff-medio)' : 'var(--d1)' }}>
            {turn === 'player' ? 'Tocca a te' : 'Il computer gioca…'}
          </div>
        )}
      </div>

      <div className="memory-grid" style={{ '--memory-cols': diffConf.cols }}>
        {deck.map(card => {
          const isUp = flipped.includes(card.id) || matched.has(card.id);
          return (
            <button
              key={card.id}
              className={`memory-card ${isUp ? 'up' : ''} ${matched.has(card.id) ? 'matched' : ''}`}
              onClick={() => handleFlip(card.id)}
              aria-label={isUp ? card.emoji : 'Carta coperta'}
            >
              <span className="memory-card-inner">
                <span className="memory-card-back">?</span>
                <span className="memory-card-front" role="img">{card.emoji}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button className="reset-btn" onClick={() => newGame()}>Nuova Partita</button>
    </div>
  );
};

export default Memory;
