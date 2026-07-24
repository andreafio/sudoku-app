# T-011 — Memory: griglie diverse per difficoltà

**Stato**: done

## Obiettivo

Invece della griglia fissa a 4 colonne, ogni difficoltà del Memory usa una
forma diversa: Facile 3 colonne (3x4), Medio 4x4, Difficile 4x5, Esperto 4x6.

## Checklist

- [x] `cols` aggiunto a ogni voce di `DIFFICULTIES` in `Memory.js`
- [x] `--memory-cols` passato inline al contenitore `.memory-grid`
- [x] `Memory.css`: `grid-template-columns` legge `var(--memory-cols, 4)`
- [x] Verificato in browser: 3/4/4/4 colonne per le 4 difficoltà
