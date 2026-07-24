import React, { useState } from 'react';
import './Memory.css';

const EMOJIS = ['🐶', '🦊', '🐼', '🐸', '🦄', '🐙', '🦋', '🍉'];

const shuffledDeck = () =>
  [...EMOJIS, ...EMOJIS]
    .map(emoji => ({ emoji, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ emoji }, id) => ({ id, emoji }));

const Memory = () => {
  const [deck, setDeck] = useState(shuffledDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const newGame = () => {
    setDeck(shuffledDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
  };

  const handleFlip = (id) => {
    if (locked || flipped.includes(id) || matched.has(id)) return;
    const nowFlipped = [...flipped, id];
    setFlipped(nowFlipped);
    if (nowFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = nowFlipped;
      if (deck[a].emoji === deck[b].emoji) {
        setMatched(prev => new Set([...prev, a, b]));
        setFlipped([]);
      } else {
        setLocked(true);
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 750);
      }
    }
  };

  const won = matched.size === deck.length;

  return (
    <div className="memory">
      <div className="memory-topbar">
        <div className="memory-stat">Mosse<strong>{moves}</strong></div>
        <div className="memory-stat">Coppie<strong>{matched.size / 2}/{EMOJIS.length}</strong></div>
        {won && <div className="memory-badge">Vittoria! 🎉</div>}
      </div>

      <div className="memory-grid">
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

      <button className="reset-btn" onClick={newGame}>Nuova Partita</button>
    </div>
  );
};

export default Memory;
