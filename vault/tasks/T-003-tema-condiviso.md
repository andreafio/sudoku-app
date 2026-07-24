# T-003 — Tema condiviso

**Stato**: done

## Obiettivo

`src/App.css` diventa il tema globale: token colore (`--d1..--d9`, colori
difficoltà/semantici), gradiente animato di sfondo, layout `.App`, stili della
home e del GameShell, pulsante `.reset-btn` condiviso, `prefers-reduced-motion`.

## Checklist

- [x] Token CSS in `:root` riusabili da tutti i giochi
- [x] Stili home (card giochi) e GameShell (barra con ← Home)
- [x] `.reset-btn` condiviso (usato da tutti i giochi come "nuova partita")
- [x] `prefers-reduced-motion` rispettato per ogni animazione globale
