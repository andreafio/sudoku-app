# T-014 — Usabilità mobile: tastiera reale, swipe su 2048, meno affollamento

**Stato**: done

## Obiettivo

Feedback diretto dell'utente da telefono:

- **Cruciverba / Indovina la Parola**: su mobile la tastiera nativa compare
  solo se un `<input>` reale ha il focus; il Cruciverba ascoltava solo
  `window.keydown` (tastiera fisica) ed era di fatto non giocabile da
  telefono. Indovina la Parola usava un tastierino finto disegnato a schermo.
- **2048**: nessun supporto swipe, solo tastiera fisica + pulsanti freccia
  piccoli — scomodo su touch.
- **Generale**: pillole modalità/difficoltà troppo ravvicinate su schermi
  stretti, nessuna istruzione su come si gioca.

## Checklist

- [x] `Crossword.js`: `<input>` reale (quasi invisibile ma focus-abile,
      `inputMode`/`autoCapitalize` impostati) che guida inserimento/backspace/
      frecce; focus richiamato al tap su cella o indizio
- [x] `WordGuess.js`: stesso pattern di `<input>` reale; il tastierino a
      schermo diventa un indicatore di stato non cliccabile (span, non
      button)
- [x] `Game2048.js`: swipe touch (`touchstart`/`touchend` con soglia 24px)
      sulla griglia del giocatore, `touch-action:none` per evitare lo scroll
      della pagina durante lo swipe
- [x] `GameShell.js`: nuova prop `hint` con un suggerimento breve per gioco
- [x] `App.css`: media query sotto 420px per pillole più compatte
- [x] Verificato con Playwright in emulazione iPhone 13 (touch reale): focus
      dell'input al tap, digitazione funzionante in entrambi i giochi, swipe
      che muove la griglia 2048, zero errori console
