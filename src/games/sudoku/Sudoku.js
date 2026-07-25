import React, { useState, useEffect, useRef } from 'react';
import './Sudoku.css';

const DIFFICULTIES = [
  { key: 'facile', label: 'Facile', removed: 34, aiIntervalMs: 700 },
  { key: 'medio', label: 'Medio', removed: 45, aiIntervalMs: 550 },
  { key: 'difficile', label: 'Difficile', removed: 52, aiIntervalMs: 420 },
  { key: 'esperto', label: 'Esperto', removed: 58, aiIntervalMs: 300 },
];

const Sudoku = () => {
  const [grid, setGrid] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]);
  const [solutionGrid, setSolutionGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [errors, setErrors] = useState([]);
  const [difficulty, setDifficulty] = useState('medio');
  const [lastFilled, setLastFilled] = useState(null);
  const [mode, setMode] = useState('libera');
  const [aiProgress, setAiProgress] = useState(0);
  const [winner, setWinner] = useState(null); // 'player' | 'ai' | null
  const aiTimerRef = useRef(null);
  const inputRef = useRef(null);

  const isValid = (board, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      if (board[startRow + Math.floor(i / 3)][startCol + (i % 3)] === num) return false;
    }
    return true;
  };

  const stopAiTimer = () => {
    if (aiTimerRef.current) {
      clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  };

  const generateSudoku = (diffKey, nextMode) => {
    stopAiTimer();
    const activeDiff = DIFFICULTIES.find(d => d.key === diffKey) || DIFFICULTIES.find(d => d.key === difficulty);
    const newBoard = Array(9).fill(null).map(() => Array(9).fill(0));
    const solve = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (let num of nums) {
              if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (solve(board)) return true;
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve(newBoard);
    const solution = newBoard.map(row => [...row]);
    const puzzle = newBoard.map(row => [...row]);
    let removed = 0;
    while (removed < activeDiff.removed) {
      let r = Math.floor(Math.random() * 9);
      let c = Math.floor(Math.random() * 9);
      if (puzzle[r][c] !== 0) {
        puzzle[r][c] = 0;
        removed++;
      }
    }

    setInitialGrid(puzzle.map(row => [...row]));
    setSolutionGrid(solution);
    setGrid(puzzle.map(row => [...row]));
    setErrors([]);
    setSelectedCell(null);
    setLastFilled(null);
    setAiProgress(0);
    setWinner(null);
    if (nextMode) setMode(nextMode);
  };

  useEffect(() => {
    generateSudoku(difficulty, 'libera');
    return stopAiTimer;
    // eslint-disable-next-line
  }, []);

  // AI race timer: only ticks in 'sfida' mode while nobody has won yet
  useEffect(() => {
    stopAiTimer();
    if (mode !== 'sfida' || winner || initialGrid.length === 0) return undefined;

    const totalEmpty = initialGrid.flat().filter(v => v === 0).length || 1;
    const diff = DIFFICULTIES.find(d => d.key === difficulty);
    const step = 100 / totalEmpty;

    aiTimerRef.current = setInterval(() => {
      setAiProgress(prev => {
        const next = Math.min(100, prev + step);
        if (next >= 100) {
          stopAiTimer();
          setWinner(w => w || 'ai');
        }
        return next;
      });
    }, diff.aiIntervalMs);

    return stopAiTimer;
    // eslint-disable-next-line
  }, [mode, difficulty, initialGrid, winner]);

  const handleDifficultyChange = (key) => {
    setDifficulty(key);
    generateSudoku(key);
  };

  const handleModeChange = (nextMode) => {
    generateSudoku(difficulty, nextMode);
  };

  const handleCellClick = (row, col) => {
    if (winner) return;
    if (initialGrid[row][col] === 0) {
      setSelectedCell({ row, col });
      inputRef.current?.focus();
    }
  };

  // num === 0 clears the cell
  const handleNumberInput = (num) => {
    if (winner) return;
    if (selectedCell && initialGrid[selectedCell.row][selectedCell.col] === 0) {
      const newGrid = grid.map((row, rIndex) =>
        row.map((colValue, cIndex) =>
          (rIndex === selectedCell.row && cIndex === selectedCell.col) ? num : colValue
        )
      );
      setGrid(newGrid);
      checkErrors(newGrid);
      if (num !== 0) setLastFilled({ row: selectedCell.row, col: selectedCell.col });

      if (mode === 'sfida' && solutionGrid.length) {
        const solved = newGrid.every((row, r) => row.every((v, c) => v === solutionGrid[r][c]));
        if (solved) {
          stopAiTimer();
          setWinner('player');
        }
      }
    }
  };

  // Digits arrive through the hidden input's onChange, which is what mobile numeric
  // keypads actually fire; Backspace/Delete and arrows are handled on keydown.
  const handleInputChange = (e) => {
    const val = e.target.value;
    e.target.value = '';
    const digit = val.slice(-1);
    if (/^[1-9]$/.test(digit)) handleNumberInput(Number(digit));
    else if (digit === '0') handleNumberInput(0);
  };

  const moveSelection = (dRow, dCol) => {
    if (!selectedCell) return;
    const row = Math.min(8, Math.max(0, selectedCell.row + dRow));
    const col = Math.min(8, Math.max(0, selectedCell.col + dCol));
    if (initialGrid[row][col] === 0) setSelectedCell({ row, col });
  };

  const handleInputKeyDown = (e) => {
    if (winner) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      handleNumberInput(0);
    } else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1, 0); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1, 0); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveSelection(0, -1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); moveSelection(0, 1); }
  };

  const checkErrors = (currentGrid) => {
    let newErrors = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = currentGrid[r][c];
        if (val !== 0) {
          let isError = false;
          for (let i = 0; i < 9; i++) {
            if (i !== c && currentGrid[r][i] === val) isError = true;
            if (i !== r && currentGrid[i][c] === val) isError = true;
            const startRow = Math.floor(r / 3) * 3;
            const startCol = Math.floor(c / 3) * 3;
            if ((startRow + Math.floor(i / 3)) !== r || (startCol + (i % 3)) !== c) {
                if (currentGrid[startRow + Math.floor(i / 3)][startCol + (i % 3)] === val) isError = true;
            }
          }
          if (isError) newErrors.push(`${r}-${c}`);
        }
      }
    }
    setErrors(newErrors);
  };

  const playerProgress = (() => {
    if (!solutionGrid.length || !initialGrid.length) return 0;
    let total = 0, correct = 0;
    initialGrid.forEach((row, r) => row.forEach((v, c) => {
      if (v === 0) {
        total++;
        if (grid[r]?.[c] === solutionGrid[r][c]) correct++;
      }
    }));
    return total ? (correct / total) * 100 : 0;
  })();

  return (
    <div className="sudoku">
      <div className="mode-picker">
        <button className={`mode-pill ${mode === 'libera' ? 'active' : ''}`} onClick={() => handleModeChange('libera')}>
          Libera
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
              <div className="duel-bar-track">
                <div className="duel-bar-fill player" style={{ width: `${playerProgress}%` }} />
              </div>
            </div>
            <div className="duel-bar-row">
              <span className="duel-bar-label">Computer</span>
              <div className="duel-bar-track">
                <div className="duel-bar-fill ai" style={{ width: `${aiProgress}%` }} />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="sudoku-board">
        <input
          ref={inputRef}
          className="sudoku-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          aria-label="Scrivi il numero della cella selezionata"
        />
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => {
              const isError = errors.includes(`${rowIndex}-${colIndex}`);
              const isFixed = initialGrid[rowIndex][colIndex] !== 0;
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
              const isPopping = lastFilled?.row === rowIndex && lastFilled?.col === colIndex;
              return (
                <div
                  key={colIndex}
                  data-value={cell !== 0 ? cell : undefined}
                  className={`cell ${isSelected ? 'selected' : ''} ${isFixed ? 'fixed' : ''} ${isError ? 'error' : ''} ${isPopping ? 'pop' : ''}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onAnimationEnd={(e) => {
                    if (e.animationName === 'popIn') setLastFilled(null);
                  }}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={() => generateSudoku(difficulty)}>Nuovo Puzzle</button>
    </div>
  );
};

export default Sudoku;
