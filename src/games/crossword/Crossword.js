import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Crossword.css';

const WORD_BANK = [
  ['CASA', 'Dove si abita'],
  ['CANE', "Il migliore amico dell'uomo"],
  ['GATTO', 'Fa le fusa'],
  ['SOLE', 'Sorge a est'],
  ['LUNA', 'Satellite della Terra'],
  ['MARE', "Pieno d'acqua salata"],
  ['FIUME', 'Scorre verso il mare'],
  ['MONTE', 'Vetta da scalare'],
  ['FIORE', 'Sboccia in primavera'],
  ['ALBERO', 'Ha rami e foglie'],
  ['LIBRO', 'Si legge pagina per pagina'],
  ['PENNA', 'Serve per scrivere'],
  ['SCUOLA', "Ci si va per imparare"],
  ['TAVOLO', 'Ha quattro gambe, non cammina'],
  ['SEDIA', 'Ci si siede sopra'],
  ['PORTA', 'Si apre per entrare'],
  ['CUCINA', 'Si cucina qui'],
  ['PANE', 'Si mangia a tavola, lievitato'],
  ['VINO', "Bevanda dall'uva"],
  ['LATTE', 'Bevanda bianca'],
  ['PESCE', 'Vive in acqua e nuota'],
  ['UCCELLO', 'Vola nel cielo'],
  ['FARFALLA', 'Insetto colorato con le ali'],
  ['STELLA', 'Brilla di notte'],
  ['NUVOLA', 'Porta la pioggia'],
  ['PIOGGIA', 'Cade dal cielo'],
  ['VENTO', 'Muove le foglie'],
  ['NEVE', "Bianca e fredda d'inverno"],
  ['ESTATE', 'Stagione calda'],
  ['INVERNO', 'Stagione fredda'],
  ['AUTUNNO', 'Stagione delle foglie che cadono'],
  ['ROSSO', 'Colore del sangue'],
  ['VERDE', "Colore dell'erba"],
  ['GIALLO', 'Colore del sole'],
  ['BIANCO', 'Colore della neve'],
  ['NERO', 'Colore della notte'],
  ['TRENO', 'Viaggia sui binari'],
  ['AEREO', 'Vola nel cielo con ali di metallo'],
  ['NAVE', 'Viaggia sul mare'],
  ['STRADA', 'Percorso per le auto'],
  ['PAESE', 'Piccolo centro abitato'],
  ['SPIAGGIA', 'Sabbia vicino al mare'],
  ['ISOLA', "Terra circondata dall'acqua"],
  ['PONTE', 'Attraversa un fiume'],
  ['CASTELLO', 'Dimora di un re'],
  ['REGINA', 'Moglie del re'],
  ['DRAGO', 'Creatura leggendaria che sputa fuoco'],
  ['LUPO', 'Cugino selvatico del cane'],
  ['ORSO', 'Grande e peloso, ama il miele'],
  ['VOLPE', 'Furba e dal pelo rosso'],
  ['CONIGLIO', 'Ha lunghe orecchie e salta'],
];

const DIFFICULTIES = [
  { key: 'facile', label: 'Facile', words: 5, aiIntervalMs: 900 },
  { key: 'medio', label: 'Medio', words: 8, aiIntervalMs: 700 },
  { key: 'difficile', label: 'Difficile', words: 12, aiIntervalMs: 550 },
  { key: 'esperto', label: 'Esperto', words: 16, aiIntervalMs: 420 },
];

const WORKING_SIZE = 19;
const CENTER = Math.floor(WORKING_SIZE / 2);

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const canPlace = (grid, word, row, col, dir) => {
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'down' ? row + i : row;
    const c = dir === 'across' ? col + i : col;
    if (r < 0 || c < 0 || r >= WORKING_SIZE || c >= WORKING_SIZE) return false;
    const existing = grid[r][c];
    if (existing && existing !== word[i]) return false;
    if (!existing) {
      // avoid creating accidental adjacent words next to this new letter
      if (dir === 'across') {
        if (grid[r - 1]?.[c] || grid[r + 1]?.[c]) return false;
      } else {
        if (grid[r]?.[c - 1] || grid[r]?.[c + 1]) return false;
      }
    }
  }
  // cells immediately before/after the word must be empty
  const beforeR = dir === 'down' ? row - 1 : row;
  const beforeC = dir === 'across' ? col - 1 : col;
  const afterR = dir === 'down' ? row + word.length : row;
  const afterC = dir === 'across' ? col + word.length : col;
  if (grid[beforeR]?.[beforeC] || grid[afterR]?.[afterC]) return false;
  return true;
};

const placeWord = (grid, word, row, col, dir) => {
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'down' ? row + i : row;
    const c = dir === 'across' ? col + i : col;
    grid[r][c] = word[i];
  }
};

const generatePuzzle = (wordCount) => {
  const candidates = shuffle(WORD_BANK).slice(0, Math.min(wordCount * 3, WORD_BANK.length));
  candidates.sort((a, b) => b[0].length - a[0].length);

  const grid = Array.from({ length: WORKING_SIZE }, () => Array(WORKING_SIZE).fill(null));
  const placed = [];

  const [firstWord, firstClue] = candidates[0];
  const startCol = CENTER - Math.floor(firstWord.length / 2);
  placeWord(grid, firstWord, CENTER, startCol, 'across');
  placed.push({ word: firstWord, clue: firstClue, row: CENTER, col: startCol, dir: 'across' });

  for (let i = 1; i < candidates.length && placed.length < wordCount; i++) {
    const [word, clue] = candidates[i];
    if (placed.some(p => p.word === word)) continue;
    let bestPlacement = null;

    outer: for (let li = 0; li < word.length; li++) {
      const letter = word[li];
      for (let r = 0; r < WORKING_SIZE; r++) {
        for (let c = 0; c < WORKING_SIZE; c++) {
          if (grid[r][c] !== letter) continue;
          // try crossing vertically through this shared letter (existing word likely horizontal)
          const downRow = r - li;
          if (canPlace(grid, word, downRow, c, 'down')) { bestPlacement = { row: downRow, col: c, dir: 'down' }; break outer; }
          // try crossing horizontally through this shared letter
          const acrossCol = c - li;
          if (canPlace(grid, word, r, acrossCol, 'across')) { bestPlacement = { row: r, col: acrossCol, dir: 'across' }; break outer; }
        }
      }
    }

    if (bestPlacement) {
      placeWord(grid, word, bestPlacement.row, bestPlacement.col, bestPlacement.dir);
      placed.push({ word, clue, row: bestPlacement.row, col: bestPlacement.col, dir: bestPlacement.dir });
    }
  }

  let minR = WORKING_SIZE, maxR = -1, minC = WORKING_SIZE, maxC = -1;
  for (let r = 0; r < WORKING_SIZE; r++) {
    for (let c = 0; c < WORKING_SIZE; c++) {
      if (grid[r][c]) { minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c); }
    }
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const solution = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => grid[minR + r][minC + c])
  );
  placed.forEach(p => { p.row -= minR; p.col -= minC; });

  // number cells that start an across and/or down word
  const numberAt = Array.from({ length: rows }, () => Array(cols).fill(null));
  let counter = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!solution[r][c]) continue;
      const startsAcross = (c === 0 || !solution[r][c - 1]) && c + 1 < cols && solution[r][c + 1];
      const startsDown = (r === 0 || !solution[r - 1][c]) && r + 1 < rows && solution[r + 1][c];
      if (startsAcross || startsDown) numberAt[r][c] = counter++;
    }
  }
  placed.forEach(p => { p.number = numberAt[p.row][p.col]; });
  placed.sort((a, b) => a.number - b.number);

  return { solution, placed, numberAt, rows, cols };
};

const emptyUserGrid = (rows, cols, solution) =>
  Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (solution[r][c] ? '' : null)));

const Crossword = () => {
  const [difficulty, setDifficulty] = useState('medio');
  const [mode, setMode] = useState('libera');
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(DIFFICULTIES[1].words));
  const [userGrid, setUserGrid] = useState(() => emptyUserGrid(puzzle.rows, puzzle.cols, puzzle.solution));
  const [selected, setSelected] = useState(null); // { row, col, dir }
  const [winner, setWinner] = useState(null);
  const [aiProgress, setAiProgress] = useState(0);
  const aiTimerRef = useRef(null);
  const inputRef = useRef(null);

  const diffConf = DIFFICULTIES.find(d => d.key === difficulty);

  const cellWordMap = useMemo(() => {
    const map = {};
    puzzle.placed.forEach(p => {
      for (let i = 0; i < p.word.length; i++) {
        const r = p.dir === 'down' ? p.row + i : p.row;
        const c = p.dir === 'across' ? p.col + i : p.col;
        const key = `${r}-${c}`;
        map[key] = map[key] || {};
        map[key][p.dir] = p;
      }
    });
    return map;
  }, [puzzle]);

  const totalOpenCells = useMemo(
    () => puzzle.solution.flat().filter(Boolean).length,
    [puzzle]
  );

  const stopAiTimer = () => { if (aiTimerRef.current) { clearInterval(aiTimerRef.current); aiTimerRef.current = null; } };

  const startAiTimer = () => {
    stopAiTimer();
    if (mode !== 'sfida') return;
    const step = 100 / totalOpenCells;
    aiTimerRef.current = setInterval(() => {
      setAiProgress(prev => {
        const next = Math.min(100, prev + step);
        if (next >= 100) { stopAiTimer(); setWinner(w => w || 'ai'); }
        return next;
      });
    }, diffConf.aiIntervalMs);
  };

  const newGame = useCallback((diffKey, nextMode) => {
    stopAiTimer();
    const conf = DIFFICULTIES.find(d => d.key === diffKey) || diffConf;
    const next = generatePuzzle(conf.words);
    setDifficulty(conf.key);
    setMode(nextMode || mode);
    setPuzzle(next);
    setUserGrid(emptyUserGrid(next.rows, next.cols, next.solution));
    setSelected(null);
    setWinner(null);
    setAiProgress(0);
    // eslint-disable-next-line
  }, [mode, diffConf]);

  useEffect(() => {
    startAiTimer();
    return stopAiTimer;
    // eslint-disable-next-line
  }, [mode, puzzle]);

  useEffect(() => () => stopAiTimer(), []);

  const activeWord = selected ? cellWordMap[`${selected.row}-${selected.col}`]?.[selected.dir] : null;

  const selectCell = (row, col) => {
    if (winner || !puzzle.solution[row][col]) return;
    const entry = cellWordMap[`${row}-${col}`] || {};
    setSelected(prev => {
      if (prev && prev.row === row && prev.col === col && entry.across && entry.down) {
        return { row, col, dir: prev.dir === 'across' ? 'down' : 'across' };
      }
      const dir = (prev && entry[prev.dir]) ? prev.dir : (entry.across ? 'across' : 'down');
      return { row, col, dir };
    });
    inputRef.current?.focus();
  };

  const moveSelection = (row, col, dir) => {
    if (row < 0 || col < 0 || row >= puzzle.rows || col >= puzzle.cols) return;
    if (!puzzle.solution[row][col]) return;
    setSelected({ row, col, dir });
  };

  const setLetter = (row, col, letter) => {
    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = letter;
      return next;
    });
  };

  // Letters arrive through the hidden input's onChange (works with mobile virtual
  // keyboards, which don't reliably fire keydown for character keys); Backspace and
  // arrow keys are handled on keydown since they aren't text insertion.
  const handleInputChange = (e) => {
    const val = e.target.value;
    e.target.value = '';
    if (!selected || winner) return;
    const letter = val.slice(-1).toUpperCase();
    if (!/^[A-Z]$/.test(letter)) return;
    const { row, col, dir } = selected;
    setLetter(row, col, letter);
    const nr = dir === 'down' ? row + 1 : row;
    const nc = dir === 'across' ? col + 1 : col;
    if (nr < puzzle.rows && nc < puzzle.cols && puzzle.solution[nr][nc]) setSelected({ row: nr, col: nc, dir });
  };

  const handleInputKeyDown = (e) => {
    if (!selected || winner) return;
    const { row, col, dir } = selected;
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (userGrid[row][col]) {
        setLetter(row, col, '');
      } else {
        const pr = dir === 'down' ? row - 1 : row;
        const pc = dir === 'across' ? col - 1 : col;
        if (pr >= 0 && pc >= 0 && puzzle.solution[pr][pc]) { setLetter(pr, pc, ''); setSelected({ row: pr, col: pc, dir }); }
      }
    } else if (e.key === 'ArrowRight') moveSelection(row, col + 1, 'across');
    else if (e.key === 'ArrowLeft') moveSelection(row, col - 1, 'across');
    else if (e.key === 'ArrowDown') moveSelection(row + 1, col, 'down');
    else if (e.key === 'ArrowUp') moveSelection(row - 1, col, 'down');
  };

  useEffect(() => {
    if (winner) return;
    const filled = userGrid.flat().filter(v => v !== null && v !== '').length;
    if (filled === 0 || filled < totalOpenCells) return;
    const solved = userGrid.every((row, r) => row.every((v, c) => v === null || v === puzzle.solution[r][c]));
    if (solved) { setWinner('player'); stopAiTimer(); }
  }, [userGrid, puzzle, totalOpenCells, winner]);

  const across = puzzle.placed.filter(p => p.dir === 'across');
  const down = puzzle.placed.filter(p => p.dir === 'down');

  const playerProgress = totalOpenCells
    ? (userGrid.flat().filter((v, i) => {
        const r = Math.floor(i / puzzle.cols);
        const c = i % puzzle.cols;
        return puzzle.solution[r][c] && v === puzzle.solution[r][c];
      }).length / totalOpenCells) * 100
    : 0;

  return (
    <div className="crossword">
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

      {mode === 'sfida' && (
        <>
          {winner && (
            <div className={`duel-result ${winner === 'player' ? 'win' : 'lose'}`}>
              {winner === 'player' ? 'Hai vinto tu! 🎉' : 'Ha vinto il computer! 🤖'}
            </div>
          )}
          <div className="duel-bars">
            <div className="duel-bar-row">
              <span className="duel-bar-label">Tu</span>
              <div className="duel-bar-track"><div className="duel-bar-fill player" style={{ width: `${playerProgress}%` }} /></div>
            </div>
            <div className="duel-bar-row">
              <span className="duel-bar-label">Computer</span>
              <div className="duel-bar-track"><div className="duel-bar-fill ai" style={{ width: `${aiProgress}%` }} /></div>
            </div>
          </div>
        </>
      )}
      {mode === 'libera' && winner === 'player' && (
        <div className="duel-result win">Completato! 🎉</div>
      )}

      <div className="xw-layout">
        <div className="xw-board">
          <input
            ref={inputRef}
            className="xw-input"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            aria-label="Scrivi la lettera"
          />
          {puzzle.solution.map((row, r) => (
            <div key={r} className="xw-row">
              {row.map((letterSolution, c) => {
                if (!letterSolution) return <div key={c} className="xw-block" />;
                const isSelected = selected?.row === r && selected?.col === c;
                const isActive = activeWord && (
                  (activeWord.dir === 'across' && activeWord.row === r && c >= activeWord.col && c < activeWord.col + activeWord.word.length) ||
                  (activeWord.dir === 'down' && activeWord.col === c && r >= activeWord.row && r < activeWord.row + activeWord.word.length)
                );
                const value = userGrid[r][c];
                const isError = value && value !== letterSolution;
                const number = puzzle.numberAt[r][c];
                return (
                  <div
                    key={c}
                    className={`xw-cell ${isSelected ? 'selected' : ''} ${isActive ? 'active-word' : ''} ${isError ? 'error' : ''}`}
                    onClick={() => selectCell(r, c)}
                  >
                    {number && <span className="xw-number">{number}</span>}
                    {value}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="xw-clues">
          <div className="xw-clue-group">
            <h3>Orizzontali</h3>
            {across.map(p => (
              <button
                key={`a-${p.number}`}
                className={`xw-clue ${activeWord === p ? 'active' : ''}`}
                onClick={() => { setSelected({ row: p.row, col: p.col, dir: 'across' }); inputRef.current?.focus(); }}
              >
                <strong>{p.number}.</strong> {p.clue}
              </button>
            ))}
          </div>
          <div className="xw-clue-group">
            <h3>Verticali</h3>
            {down.map(p => (
              <button
                key={`d-${p.number}`}
                className={`xw-clue ${activeWord === p ? 'active' : ''}`}
                onClick={() => { setSelected({ row: p.row, col: p.col, dir: 'down' }); inputRef.current?.focus(); }}
              >
                <strong>{p.number}.</strong> {p.clue}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="reset-btn" onClick={() => newGame(difficulty, mode)}>Nuovo Cruciverba</button>
    </div>
  );
};

export default Crossword;
