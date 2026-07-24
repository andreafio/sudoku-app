# T-013 — Gioco Cruciverba (generato proceduralmente)

**Stato**: done

## Obiettivo

Cruciverba generato al volo da una banca di ~50 parole italiane con indizio:
piazzamento della prima parola al centro, poi incroci successivi validati
(niente lettere in conflitto, niente parole adiacenti accidentali), griglia
ritagliata al bounding box, numerazione automatica delle caselle. Difficoltà =
quante parole si tenta di piazzare (5/8/12/16). Modalità Sfida vs Computer con
lo stesso meccanismo a barra di avanzamento del Sudoku.

## Checklist

- [x] `src/games/crossword/Crossword.js`: generatore (`generatePuzzle`),
      selezione cella/parola, input da tastiera con avanzamento automatico,
      verifica lettera per lettera
- [x] `src/games/crossword/Crossword.css`: griglia con celle nere/bianche,
      numerazione, pannello indizi orizzontali/verticali
- [x] Modalità Libera / Sfida vs Computer riusando `.duel-bars`/`.duel-result`
- [x] Verificato in browser: griglia generata senza conflitti, inserimento
      lettera con evidenziazione errore, Sfida con barra di progresso
