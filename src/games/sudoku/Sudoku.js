import React, { useState, useEffect } from 'react';
import './Sudoku.css';

const DIFFICULTIES = [
  { key: 'facile', label: 'Facile', removed: 34 },
  { key: 'medio', label: 'Medio', removed: 45 },
  { key: 'difficile', label: 'Difficile', removed: 52 },
  { key: 'esperto', label: 'Esperto', removed: 58 },
];

const Sudoku = () => {
  const [grid, setGrid] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [errors, setErrors] = useState([]);
  const [difficulty, setDifficulty] = useState('medio');
  const [lastFilled, setLastFilled] = useState(null);

  const isValid = (board, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      if (board[startRow + Math.floor(i / 3)][startCol + (i % 3)] === num) return false;
    }
    return true;
  };

  const generateSudoku = (diffKey) => {
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
    setGrid(puzzle.map(row => [...row]));
    setErrors([]);
    setSelectedCell(null);
    setLastFilled(null);
  };

  useEffect(() => {
    generateSudoku(difficulty);
    // difficulty is only read on mount; subsequent changes go through handleDifficultyChange
  }, []); // eslint-disable-line

  const handleDifficultyChange = (key) => {
    setDifficulty(key);
    generateSudoku(key);
  };

  const handleCellClick = (row, col) => {
    if (initialGrid[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num) => {
    if (selectedCell && initialGrid[selectedCell.row][selectedCell.col] === 0) {
      const newGrid = grid.map((row, rIndex) =>
        row.map((colValue, cIndex) =>
          (rIndex === selectedCell.row && cIndex === selectedCell.col) ? num : colValue
        )
      );
      setGrid(newGrid);
      checkErrors(newGrid);
      setLastFilled({ row: selectedCell.row, col: selectedCell.col });
    }
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

  return (
    <div className="sudoku">
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

      <div className="sudoku-board">
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

      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} data-value={num} onClick={() => handleNumberInput(num)}>
            {num}
          </button>
        ))}
      </div>
      <button className="reset-btn" onClick={() => generateSudoku(difficulty)}>Nuovo Puzzle</button>
    </div>
  );
};

export default Sudoku;
