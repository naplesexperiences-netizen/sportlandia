# SPORTLANDIA - Kiosk Digitale Touch Screen

> ## ⚠️ In produzione — leggere prima di modificare
>
> Questo totem è **installato e acceso** nella sede del cliente a
> Castellammare di Stabia. Quello che finisce su `main` finisce sullo schermo.
>
> **Indirizzo pubblicato:** https://naplesexperiences-netizen.github.io/sportlandia/
>
> **Copia di sicurezza:** branch `backup/totem-funzionante`
>
> **Ripristino**, se qualcosa va storto:
> ```
> git fetch origin backup/totem-funzionante
> git checkout origin/backup/totem-funzionante -- .
> ```
>
> ### Perché questo repository esiste
>
> Fino a ottobre 2026 il totem viveva dentro `experiences-demos`, in mezzo ad
> altre 200 demo. Una passata automatica di meta tag SEO lo ha modificato
> partendo da una base vecchia, ha vinto un conflitto di merge e lo ha
> riportato indietro di sette commit: galleria GSAP, correzioni di
> accessibilità e scala tipografica, persi insieme e finiti in onda sullo
> schermo del cliente.
>
> Sta qui da solo perché il lavoro in blocco sui prototipi non possa più
> raggiungerlo. Non è una questione di disciplina: è che adesso non è
> fisicamente nello stesso posto.
>
> ### Se modifichi qualcosa
>
> La CI controlla da sola che GSAP sia ancora vendorizzato, che ogni immagine
> citata esista e che `index.html` non sia tornato alla versione pre-v2 (~775
> righe contro ~1400). Se diventa rossa, **non forzare**: è esattamente il
> controllo che mancava quando il totem si è rotto.

## 🎄 In onda: versione di Natale

Dal novembre 2026 la radice (`index.html`) è la **versione natalizia**. La
versione normale è salvata, identica, in **`originale/`**.

- **Ghirlanda-cornice** di abete attorno allo schermo, con palline, fiocchi
  rossi e lucine che brillano.
- **Nevicata in sovraimpressione** a episodi: la prima dopo ~6 s, poi una
  ogni 40–80 s per ~25 s. Resta sotto il popup orari.
- **Musica di Natale**: carillon generato dal browser (nessun file, funziona
  offline) su melodie tradizionali di pubblico dominio — Jingle Bells, We
  Wish You a Merry Christmas, Astro del Ciel, Deck the Halls. Pulsante ♫ nei
  controlli per spegnerla/riaccenderla.
- Accenti oro e rosso al posto del ciano; “Buone Feste” nell'intestazione.
- **Sfondo con video del camino** (`video/camino.mp4`, 1,6 MB, 720×1280,
  ~9,5 s in ciclo con dissolvenza sulla giunzione, senza audio). Se non
  carica resta il fotogramma fisso `video/camino.webp`. Per toglierlo basta
  cancellare il blocco `<video class="fire">` da `index.html`.
- Ghirlanda, neve e musica stanno in `natale.js`: se si rompe, la galleria
  continua a girare.

**Audio sul totem.** I browser fanno partire l'audio solo dopo un tocco. Per
farlo partire da solo all'accensione, avviare Chrome in kiosk con
`--autoplay-policy=no-user-gesture-required`; altrimenti parte al primo tocco.

**Registrazioni vere al posto del carillon.** Copiare gli mp3 in `musica/` ed
elencarli in `MUSIC_FILES` dentro `natale.js`. Solo brani con diritti in
regola: la musica diffusa in un locale aperto al pubblico è soggetta a SIAE/SCF.

**Finite le feste — tornare alla versione normale:**
```
git checkout -b fine-natale origin/main
sed 's#"\.\./images/#"images/#g; s#"\.\./vendor/#"vendor/#g' originale/index.html > index.html
git rm natale.js && git commit -am "Fine Natale: torna la versione normale"
```
(oppure ripristinare da `backup/totem-funzionante`, che è la versione normale).
Nel frattempo la versione normale resta visibile su `/sportlandia/originale/`.

## 📱 Descrizione

Sito web interattivo verticale (portrait) ottimizzato per schermi touch screen 42" HD presso Sportlandia, centro fitness a Castellammare di Stabia.

### 🎯 Caratteristiche Principali

- **Layout Verticale (Portrait)** - Ottimizzato per schermi 42" touch screen
- **Galleria animata con GSAP** - Timeline interrompibili: il tap rapido su
  avanti/indietro resta sempre coerente
- **Due modalità di slide** - Le locandine ufficiali si vedono per intero
  (`contain`, mai tagliate); le foto riempiono lo schermo con testo sovrapposto
- **Popup orari** - Tocca una slide per il dettaglio degli orari
- **Play/pausa** - Lo scorrimento automatico si può fermare
- **Barra di avanzamento sincrona** - La barra *è* il timer, quindi pausa e
  ripresa sono esatte
- **Accessibile** - Focus visibile, `aria-live`, `prefers-reduced-motion`
- **Funziona offline** - GSAP vendorizzato, font non bloccante (init ~110 ms)

## 📚 Corsi Disponibili (orari ufficiali stagione 25/26)

1. **Sala Attrezzi** 🏋️ — Lun-Ven 07:00-21:00, Sab 09:00-12:00
2. **Pilates Matwork** 🧘 — Base / Intermedio / Avanzato
3. **Pilates Reformer** ⚙️ — Lun-Sab, sessioni multiple giornaliere
4. **Pilates Studio** 🎯 — Su appuntamento (Cadillac, Barile)
5. **TEC-Room** 💪 — Mar/Gio, allenamento tecnico-funzionale
6. **Les Mills** 📺 — Programmi Shapes, Strength, Circuito
7. **Fisiorehab 360** 🏥 — Fisioterapia e riabilitazione su appuntamento
8. **GREENtosi** 🌱 — Sostenibilità e impegno eco-friendly

> Orari estratti dal PDF ufficiale **SPORTLANDIA ORARI 25/26**.

## 📍 Contatti

- **Sportlandia · SSD INFITNESS ARL**
- Corso Alcide De Gasperi, 177/B — Castellammare di Stabia (NA)
- Tel. +39 081 871 8076
- Email: ssdinfitness@gmail.com
- **Apertura Centro**: Lun-Ven 07:00-21:00 · Sabato 08:00-12:30

## 🎨 Design

- **Colori Primari**: Blu cobalto (#0d47a1, #1976d2) + Ciano Infitness (#00bcd4)
  su navy profondo (#062c5c) — palette del marchio Sportlandia
- **Font**: Barlow Condensed (titoli) + Barlow (testo), coppia tipografica
  per brand sportivi; caricati in modo non bloccante
- **Icone**: SVG inline (nessuna emoji)
- **Animazioni**: Timeline GSAP 3.15. Navigazione manuale = scorrimento
  direzionale; avanzamento automatico = dissolvenza

## 🖱️ Interazioni

### Navigazione Principale
- **‹ Pulsante Sinistra**: Corso precedente
- **Contatore**: Posizione attuale / Totale corsi
- **⏸ Play/Pausa**: Ferma o riprende lo scorrimento automatico
- **› Pulsante Destra**: Corso successivo
- **Pallini**: Salto diretto a un corso

### Dettagli Corsi
- **Click sulla Card**: Apre popup con orari completi
- **Click Esterno**: Chiude il popup
- **Tasto Esc**: Chiude il popup

### Tasti Supportati
- **Freccia Sinistra/Destra**: Navigazione galleria
- **Spazio**: Play/pausa
- **Escape**: Chiudi popup

### Comportamento automatico
Lo scorrimento si ferma da solo quando la pagina non è visibile, quando la
galleria esce dallo schermo e quando il popup orari è aperto.

## 📱 Specifiche Tecniche

- **HTML5** - Semantica moderna
- **CSS3** - Custom properties per le fasce fisse (`--chrome-top/bottom`)
- **GSAP 3.15** - Vendorizzato in `vendor/` (73 KB): il totem deve funzionare
  anche senza rete
- **Responsive** - 1080×1920 (42"), tablet e mobile

## 🌐 Branding

Footer con contatti Sportlandia e link a **naplesexperiences.com**.

## 🚀 Utilizzo

1. Apri `index.html` nel browser
2. Usa i pulsanti ← e → per navigare tra i corsi
3. Clicca su ogni corso per visualizzare gli orari completi
4. Il sito è touch-friendly per schermi da 42"

## 📁 File Structure

```
sportlandia/   (radice del repository)
├── index.html           # Pagina unica: HTML, CSS e JS inline (~775 righe)
├── images/              # 13 WebP: locandine ufficiali, foto e logo
├── vendor/
│   └── gsap.min.js      # GSAP 3.15 vendorizzato (73 KB), per il funzionamento offline
└── README.md            # Questo file
```

## 👥 Crediti

- **Cliente**: Sportlandia - Centro Fitness Castellammare di Stabia
- **Sviluppatore**: experiences SRL
- **Anno**: 2026

## 📧 Contatti

Per domande o modifiche contatta **experiences SRL**:
- 🌐 [Sito Web](https://naplesexperiences.com)
- 📧 [Email](mailto:info@naplesexperiences.com)

---

**© 2026 Sportlandia - Powered by naplesexperiences.com**
