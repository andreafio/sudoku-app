# T-010 — Modalità Sfida contro il Computer in tutti i giochi

**Stato**: done

## Obiettivo

Ogni gioco ha una modalità competitiva contro l'AI:

- **Sudoku — Sfida**: il computer risolve lo stesso puzzle a velocità legata alla
  difficoltà; vinci se completi la griglia (senza errori) prima di lui
- **2048 — Sfida**: il computer gioca la sua griglia accanto alla tua (mossa
  greedy ogni ~1s); vince chi arriva prima a 2048, o chi ha più punti quando
  entrambe le griglie sono bloccate
- **Memory — Sfida**: a turni contro il computer, che ricorda le carte viste con
  probabilità legata alla difficoltà; coppia trovata = punto e turno extra
- **Tris**: già presente (vs Computer), potenziata dai livelli AI di T-009

## Checklist

- [x] Pillole modalità condivise (`.mode-pill` in App.css)
- [x] Sudoku: timer AI, contatore progresso, banner vittoria/sconfitta
- [x] 2048: board AI in miniatura, esito sfida
- [x] Memory: turni, memoria probabilistica AI, punteggi
- [x] Verifica browser di ogni sfida
