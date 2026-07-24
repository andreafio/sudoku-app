# Roadmap

## Visione

Da app single-game (Sudoku) a piccola sala giochi web: una home colorata con card,
un tema condiviso pastello su gradiente animato, e una collezione di giochi da
tavolo/puzzle, tutti senza dipendenze extra oltre React.

## Fase 1 — Fondamenta (questa iterazione)

- Vault di pianificazione nel repo (T-001)
- Sudoku estratto in modulo riusabile (T-002)
- Tema condiviso via token CSS (T-003)
- Home con card + GameShell di navigazione (T-004)

## Fase 2 — Nuovi giochi (questa iterazione)

- 2048 (T-005)
- Memory (T-006)
- Tris con opzione vs computer (T-007)

## Fase 3 — Qualità (questa iterazione)

- Smoke test browser su ogni gioco, screenshot, stati vault aggiornati (T-008)

## Backlog (future iterazioni)

- **Campo minato**: griglia con difficoltà, coerente con lo stile Sudoku
- **Snake**: canvas o griglia CSS, controlli tastiera/swipe
- **Punteggi persistenti**: localStorage per best score (2048), tempi (Memory), vittorie (Tris)
- **Timer e statistiche Sudoku**: cronometro, conteggio errori, celle suggerite
- **PWA**: manifest + service worker per installazione su mobile
- **Modalità scura**: secondo set di token colore
- **i18n**: estrazione stringhe (oggi solo italiano)
