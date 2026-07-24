import React from 'react';

const GameShell = ({ title, hint, onBack, children }) => (
  <div className="game-shell">
    <div className="game-shell-bar">
      <button className="back-btn" onClick={onBack}>← Home</button>
      <h2>{title}</h2>
      <span />
    </div>
    {hint && <p className="game-shell-hint">{hint}</p>}
    {children}
  </div>
);

export default GameShell;
