# Vault — Sala Giochi

Fonte di verità per la pianificazione del progetto: revisione UI multi-gioco e nuovi giochi.
Ogni task vive in `tasks/` come file markdown con obiettivo, checklist e stato.

## Stato dei task

| ID | Task | Stato |
|----|------|-------|
| [T-001](tasks/T-001-vault.md) | Creare il vault | done |
| [T-002](tasks/T-002-estrarre-sudoku.md) | Estrarre il Sudoku in modulo | done |
| [T-003](tasks/T-003-tema-condiviso.md) | Tema condiviso | done |
| [T-004](tasks/T-004-home-gameshell.md) | Home + GameShell | done |
| [T-005](tasks/T-005-2048.md) | Gioco 2048 | done |
| [T-006](tasks/T-006-memory.md) | Gioco Memory | done |
| [T-007](tasks/T-007-tris.md) | Gioco Tris | done |
| [T-008](tasks/T-008-verifica.md) | Verifica e rifiniture | done |
| [T-009](tasks/T-009-difficolta-tutti.md) | Difficoltà per tutti i giochi | done |
| [T-010](tasks/T-010-sfida-ai.md) | Modalità Sfida contro il Computer | done |
| [T-011](tasks/T-011-memory-griglie.md) | Memory: griglie diverse per difficoltà | done |
| [T-012](tasks/T-012-indovina-parola.md) | Gioco Indovina la Parola (Wordle) | done |
| [T-013](tasks/T-013-cruciverba.md) | Gioco Cruciverba (generato proceduralmente) | done |

Stati possibili: `todo` → `in-progress` → `done`.

## Ordine di esecuzione

T-001 → T-002/T-003 → T-004 → T-005/T-006/T-007 (indipendenti tra loro) → T-008 → T-009 → T-010 → T-011/T-012/T-013

## Riferimenti

- [Roadmap e backlog](roadmap.md)
- Branch di lavoro: `claude/remote-control-9o1365`
