import React from 'react';

const GameShell = ({ title, onBack, children }) => (
  <div className="game-shell">
    <div className="game-shell-bar">
      <button className="back-btn" onClick={onBack}>← Home</button>
      <h2>{title}</h2>
      <span />
    </div>
    {children}
  </div>
);

export default GameShell;
