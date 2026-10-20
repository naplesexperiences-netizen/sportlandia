# Protezione del repository

Questo repository è il totem acceso nella sede del cliente. Quello che finisce
su `main` finisce sullo schermo, senza passaggi intermedi e senza che nessuno
lo guardi prima.

Le difese sono tre, e due sono già attive.

---

## 1. CI — attiva

Gira a ogni push e a ogni pull request. Controlla le quattro cose che possono
rompere il totem senza fare rumore:

| Controllo | Cosa intercetta |
|---|---|
| HTMLHint su `index.html` | HTML malformato |
| `vendor/gsap.min.js` esiste ed è referenziato | Senza GSAP la galleria non parte. In sede, con la rete incerta, lo schermo resta fermo su una slide |
| Ogni `images/*.webp` citata esiste | Un `background-image` rotto **non emette errori**: la slide resta semplicemente vuota |
| `index.html` sotto le 1000 righe | La v2 ne ha ~775, la versione pre-v2 ne aveva ~1400. Se il conteggio esplode, qualcuno ha riportato indietro il file |

L'ultimo è il controllo che a ottobre 2026 non c'era. È esattamente il guasto
che si è verificato.

## 2. Branch di backup — attivo

`backup/totem-funzionante` tiene una copia della versione buona.

```
git fetch origin backup/totem-funzionante
git checkout origin/backup/totem-funzionante -- .
```

## 3. Ruleset — DA ATTIVARE A MANO

Questa è l'unica che manca, e deve farla una persona: le API di impostazione
dei ruleset non sono raggiungibili dalle sessioni automatiche.

### `main` protetto

**Settings → Rules → Rulesets → New branch ruleset**

| Campo | Valore |
|---|---|
| Ruleset Name | `main protetto` |
| Enforcement status | `Active` |
| Target branches | `Include default branch` |
| Spunta | `Require a pull request before merging` |
| Spunta | `Require review from Code Owners` |
| Spunta | `Require status checks to pass` → aggiungi `Controlli sul totem` |

### `backup` intoccabile

**New branch ruleset**, di nuovo

| Campo | Valore |
|---|---|
| Ruleset Name | `backup intoccabile` |
| Enforcement status | `Active` |
| Target branches | `Include by pattern` → `backup/*` |
| Spunta | `Restrict updates` |
| Spunta | `Restrict deletions` |

### Cosa cambia dopo

Nessuno potrà più spingere direttamente su `main` — né tu, né le sessioni
automatiche. Ogni modifica passerà da una pull request, con la CI verde e la
tua approvazione.

Qui quel costo è trascurabile: a questo repository si mette mano poche volte
l'anno. In `experiences-demos` sarebbe stato insostenibile, perché avrebbe
rallentato oltre 200 prototipi per proteggerne uno. È il motivo per cui il
totem è stato portato via da lì invece di proteggere quello.

---

## Se devi ripubblicare in fretta e il ruleset ti blocca

Non disattivarlo. Apri una pull request dal tuo branch, aspetta la CI e
unisci: su un file solo sono due minuti. Il giorno in cui servirà davvero
saltare la fila, sarà anche il giorno in cui è più facile sbagliare.
