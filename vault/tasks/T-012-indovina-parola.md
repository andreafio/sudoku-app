# T-012 — Gioco Indovina la Parola (Wordle)

**Stato**: done

## Obiettivo

Wordle in italiano: parola bersaglio da banca lessicale, 6 tentativi, feedback
colorato lettera per lettera (corretto/presente/assente) con gestione corretta
delle lettere ripetute. Difficoltà = lunghezza parola (4/5/6/7). Modalità Sfida
vs Computer: l'AI tenta la stessa parola filtrando le proprie ipotesi in base
al feedback ricevuto, a un ritmo legato alla difficoltà.

## Checklist

- [x] `src/games/wordguess/WordGuess.js`: banca parole per lunghezza, calcolo
      feedback a due passate, tastierino a schermo + tastiera fisica
- [x] `src/games/wordguess/WordGuess.css`: tessere colorate, tastierino,
      board AI in miniatura in modalità Sfida
- [x] Modalità Libera / Sfida vs Computer con `.mode-pill` condiviso
- [x] Verificato in browser: tentativo con feedback corretto, colori tastiera,
      race in modalità Sfida
