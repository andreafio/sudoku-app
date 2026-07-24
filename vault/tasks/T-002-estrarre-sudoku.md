# T-002 — Estrarre il Sudoku in modulo

**Stato**: done

## Obiettivo

Spostare la logica del Sudoku da `src/App.js` a `src/games/sudoku/Sudoku.js` +
`Sudoku.css`, senza alcun cambio di comportamento: 4 difficoltà, rilevamento
errori, animazioni pop/pulse/shake restano identiche.

## Checklist

- [x] `src/games/sudoku/Sudoku.js` con la logica attuale (h1 rimosso: lo fornisce GameShell)
- [x] `src/games/sudoku/Sudoku.css` con gli stili specifici del gioco
- [x] Verifica in browser: generazione, selezione, inserimento, errori, difficoltà
