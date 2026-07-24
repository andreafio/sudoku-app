import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WordGuess.css';

const WORDS_BY_LENGTH = {
  4: ['CASA', 'CANE', 'MARE', 'SOLE', 'LUNA', 'VINO', 'PANE', 'RISO', 'NAVE', 'TORO',
      'LUPO', 'ORSO', 'MELA', 'PERA', 'NOCE', 'FICO', 'ROSA', 'PESO', 'FOTO', 'IDEA',
      'ARIA', 'BASE', 'DADO', 'BUIO', 'NIDO'],
  5: ['GATTO', 'LIBRO', 'PORTA', 'TETTO', 'CIELO', 'FIUME', 'FIORE', 'ACQUA', 'FORMA',
      'VERDE', 'ROSSO', 'PONTE', 'MONTE', 'CAMPO', 'FORNO', 'VETRO', 'SEDIA', 'SCALA',
      'PIZZA', 'TRENO', 'AEREO'],
  6: ['GIALLO', 'STRADA', 'STELLA', 'NUVOLA', 'FIAMMA', 'CUCINA', 'MUSICA', 'SCUOLA',
      'BANANA', 'COLORE', 'MOTORE', 'TAVOLO', 'CAMINO', 'PATATA', 'CAROTA', 'GIORNO',
      'QUADRO'],
  7: ['PALAZZO', 'CAVALLO', 'UCCELLO', 'FRAGOLA', 'LEZIONE', 'SORELLA', 'BAMBINO',
      'CAMICIA', 'ARANCIA', 'GIRAFFA', 'MERCATO', 'BALCONE'],
};

const DIFFICULTIES = [
  { key: 'facile', label: 'Facile', length: 4, aiIntervalMs: 2600 },
  { key: 'medio', label: 'Medio', length: 5, aiIntervalMs: 2000 },
  { key: 'difficile', label: 'Difficile', length: 6, aiIntervalMs: 1500 },
  { key: 'esperto', label: 'Esperto', length: 7, aiIntervalMs: 1100 },
];

const MAX_ATTEMPTS = 6;
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const randomWord = (length) => {
  const pool = WORDS_BY_LENGTH[length];
  return pool[Math.floor(Math.random() * pool.length)];
};

// Classic two-pass Wordle feedback, handles repeated letters correctly.
const getFeedback = (guess, target) => {
  const result = Array(guess.length).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');
  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct';
      targetArr[i] = null;
      guessArr[i] = null;
    }
  }
  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] == null) continue;
    const idx = targetArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i] = 'present';
      targetArr[idx] = null;
    }
  }
  return result;
};

const isConsistent = (word, guess, feedback) => {
  const wordFeedback = getFeedback(guess, word);
  return wordFeedback.every((f, i) => f === feedback[i]);
};

const STATUS_RANK = { absent: 0, present: 1, correct: 2 };

const WordGuess = () => {
  const [difficulty, setDifficulty] = useState('medio');
  const [mode, setMode] = useState('libera');
  const [target, setTarget] = useState(() => randomWord(5));
  const [guesses, setGuesses] = useState([]); // [{ word, feedback }]
  const [current, setCurrent] = useState('');
  const [shake, setShake] = useState(false);
  const [winner, setWinner] = useState(null); // 'player' | 'ai' | 'draw' | null

  const [aiGuesses, setAiGuesses] = useState([]);
  const aiCandidatesRef = useRef([]);
  const aiTimerRef = useRef(null);
  const winnerRef = useRef(null);

  useEffect(() => { winnerRef.current = winner; }, [winner]);

  const diffConf = DIFFICULTIES.find(d => d.key === difficulty);
  const wordLength = diffConf.length;
  const playerDone = winner !== null || guesses.length >= MAX_ATTEMPTS;

  const stopAiTimer = () => {
    if (aiTimerRef.current) { clearInterval(aiTimerRef.current); aiTimerRef.current = null; }
  };

  const startAiTimer = (newTarget) => {
    stopAiTimer();
    aiTimerRef.current = setInterval(() => {
      if (winnerRef.current) return;
      setAiGuesses(prev => {
        if (prev.length >= MAX_ATTEMPTS) { stopAiTimer(); return prev; }
        const candidates = aiCandidatesRef.current.length ? aiCandidatesRef.current : WORDS_BY_LENGTH[newTarget.length];
        const guess = candidates[Math.floor(Math.random() * candidates.length)];
        const feedback = getFeedback(guess, newTarget);
        aiCandidatesRef.current = candidates.filter(w => w !== guess && isConsistent(w, guess, feedback));
        const next = [...prev, { word: guess, feedback }];
        if (guess === newTarget) {
          stopAiTimer();
          setWinner(w => w || 'ai');
        } else if (next.length >= MAX_ATTEMPTS) {
          stopAiTimer();
        }
        return next;
      });
    }, diffConf.aiIntervalMs);
  };

  const newGame = useCallback((diffKey, nextMode) => {
    stopAiTimer();
    const conf = DIFFICULTIES.find(d => d.key === diffKey) || diffConf;
    const newTarget = randomWord(conf.length);
    setDifficulty(conf.key);
    setMode(nextMode || mode);
    setTarget(newTarget);
    setGuesses([]);
    setCurrent('');
    setWinner(null);
    setAiGuesses([]);
    aiCandidatesRef.current = WORDS_BY_LENGTH[conf.length];
    if ((nextMode || mode) === 'sfida') startAiTimer(newTarget);
    // eslint-disable-next-line
  }, [mode, diffConf]);

  useEffect(() => () => stopAiTimer(), []);

  const submitGuess = useCallback(() => {
    if (playerDone || current.length !== wordLength) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    const feedback = getFeedback(current, target);
    setGuesses(prev => [...prev, { word: current, feedback }]);
    if (current === target) {
      setWinner(w => w || 'player');
      stopAiTimer();
    }
    setCurrent('');
  }, [current, wordLength, target, playerDone]);

  const pressKey = useCallback((key) => {
    if (playerDone) return;
    if (key === 'ENTER') { submitGuess(); return; }
    if (key === 'BACK') { setCurrent(c => c.slice(0, -1)); return; }
    setCurrent(c => (c.length < wordLength ? c + key : c));
  }, [playerDone, wordLength, submitGuess]);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toUpperCase();
      if (k === 'ENTER') pressKey('ENTER');
      else if (k === 'BACKSPACE') pressKey('BACK');
      else if (/^[A-Z]$/.test(k)) pressKey(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressKey]);

  useEffect(() => {
    if (mode !== 'sfida' || winner) return;
    if (guesses.length >= MAX_ATTEMPTS && aiGuesses.length >= MAX_ATTEMPTS) {
      setWinner('draw');
    }
  }, [guesses.length, aiGuesses.length, mode, winner]);

  const keyStatus = {};
  guesses.forEach(({ word, feedback }) => {
    word.split('').forEach((letter, i) => {
      const rank = STATUS_RANK[feedback[i]];
      if (rank > STATUS_RANK[keyStatus[letter]] || keyStatus[letter] === undefined) {
        keyStatus[letter] = feedback[i];
      }
    });
  });

  const rowsToShow = Math.max(MAX_ATTEMPTS, guesses.length + 1);

  return (
    <div className="wordguess">
      <div className="mode-picker">
        <button className={`mode-pill ${mode === 'libera' ? 'active' : ''}`} onClick={() => newGame(difficulty, 'libera')}>
          Libera
        </button>
        <button className={`mode-pill ${mode === 'sfida' ? 'active' : ''}`} onClick={() => newGame(difficulty, 'sfida')}>
          Sfida vs Computer
        </button>
      </div>

      <div className="difficulty-picker">
        {DIFFICULTIES.map(d => (
          <button
            key={d.key}
            className={`difficulty-pill difficulty-${d.key} ${difficulty === d.key ? 'active' : ''}`}
            onClick={() => newGame(d.key, mode)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {winner && (
        <div className={`duel-result ${winner === 'player' ? 'win' : winner === 'ai' ? 'lose' : ''}`}>
          {winner === 'player' && 'Hai indovinato tu! 🎉'}
          {winner === 'ai' && `Ha vinto il computer! La parola era ${target} 🤖`}
          {winner === 'draw' && `Nessuno ha indovinato: era ${target}`}
        </div>
      )}
      {!winner && mode === 'libera' && guesses.length >= MAX_ATTEMPTS && (
        <div className="duel-result lose">Tentativi finiti: era {target}</div>
      )}

      {mode === 'sfida' && (
        <div className="wg-stats">
          <div className="wg-stat">Tu<strong>{guesses.length}/{MAX_ATTEMPTS}</strong></div>
          <div className="wg-stat">Computer<strong>{aiGuesses.length}/{MAX_ATTEMPTS}</strong></div>
        </div>
      )}

      <div className="wg-boards">
        <div className="wg-board">
          {Array.from({ length: rowsToShow }).map((_, r) => {
            const rowData = guesses[r];
            const isCurrentRow = r === guesses.length;
            return (
              <div key={r} className={`wg-row ${shake && isCurrentRow ? 'shake' : ''}`}>
                {Array.from({ length: wordLength }).map((_, c) => {
                  let letter = '';
                  let status = '';
                  if (rowData) {
                    letter = rowData.word[c];
                    status = rowData.feedback[c];
                  } else if (isCurrentRow) {
                    letter = current[c] || '';
                  }
                  return (
                    <div key={c} className={`wg-tile ${status}`}>{letter}</div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {mode === 'sfida' && (
          <div className="wg-board wg-board-ai">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, r) => {
              const rowData = aiGuesses[r];
              return (
                <div key={r} className="wg-row">
                  {Array.from({ length: wordLength }).map((_, c) => (
                    <div key={c} className={`wg-tile wg-tile-mini ${rowData ? rowData.feedback[c] : ''}`}>
                      {rowData ? rowData.word[c] : ''}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="wg-keyboard">
        {KEYBOARD_ROWS.map((row, r) => (
          <div key={r} className="wg-key-row">
            {row.map(key => (
              <button
                key={key}
                className={`wg-key ${key.length > 1 ? 'wg-key-wide' : ''} ${keyStatus[key] || ''}`}
                onClick={() => pressKey(key)}
              >
                {key === 'BACK' ? '⌫' : key === 'ENTER' ? 'INVIO' : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={() => newGame(difficulty, mode)}>Nuova Parola</button>
    </div>
  );
};

export default WordGuess;
