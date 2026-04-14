# Lifter House — VSL Funnel

## Struttura file

```
Vsl_Lifter_House/
├── index.html          ← Optin page (entry point del funnel)
├── grazie.html         ← Thank you post-optin
├── vsl.html            ← Video Sales Letter (CTA ritardata)
├── questionario.html   ← Qualificazione multi-step (5 domande)
├── prenota.html        ← Calendly booking page
├── non-qualificato.html ← Per lead non qualificati
└── README.md           ← Questo file
```

## Flusso

```
index.html → grazie.html → vsl.html → questionario.html ──┬→ prenota.html
                                                           └→ non-qualificato.html
```

---

## 1. Integrare ConvertKit / Kit

### Crea il form in ConvertKit
1. Vai su **app.convertkit.com → Forms → New Form**
2. Crea un form di tipo "Inline"
3. Copia l'**UID** del form (es. `abc12345`)

### Inserisci il form nell'optin page
In `index.html`, trova il commento `CONVERTKIT FORM EMBED` e:
1. Sostituisci `YOUR_FORM_UID` con il tuo UID
2. Sostituisci `YOUR-ACCOUNT` con il subdomain del tuo account CK
3. **Decommenta** il tag `<script>` di ConvertKit
4. **Commenta** (o rimuovi) il blocco `FALLBACK FORM`

```html
<!-- Prima (fallback) -->
<form class="fallback-form" action="grazie.html" method="get">...</form>

<!-- Dopo (ConvertKit) -->
<script async data-uid="abc12345" src="https://tuoaccount.ck.page/abc12345/index.js"></script>
```

### Redirect a grazie.html dopo l'optin
In ConvertKit → Form settings → Confirmation: imposta **Custom Redirect URL** su:
```
https://tuodominio.it/grazie.html
```
(o il path relativo se usi file locali: `grazie.html`)

### Aggiungi il tag "in-sequenza-vsl"
In ConvertKit → Automations → crea una regola:
- **Trigger**: Subscriber joins form [il tuo form]
- **Action**: Add tag `in-sequenza-vsl`

---

## 2. Integrare Calendly

### Crea l'evento
1. Vai su **calendly.com → New Event Type**
2. Crea un evento da **30 minuti** (es. "Chiamata Strategica con Gabriele")
3. Copia il link (es. `https://calendly.com/gabriele-lifterhouse/30min`)

### Inserisci l'embed in prenota.html
In `prenota.html`, trova il commento `CALENDLY INLINE EMBED` e:
1. Sostituisci `YOUR-LINK` con il tuo URL Calendly
2. **Decommenta** il blocco `<div class="calendly-inline-widget">` e il `<script>`
3. **Rimuovi** il blocco `<!-- PLACEHOLDER -->`

```html
<div class="calendly-inline-widget"
     data-url="https://calendly.com/gabriele-lifterhouse/30min?background_color=0f0f0f&text_color=ffffff&primary_color=a90707"
     style="min-width:320px;height:680px;">
</div>
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
```

I parametri `background_color`, `text_color` e `primary_color` adattano Calendly allo stile Lifter House.

---

## 3. Automazione: Rimozione dalla sequenza alla prenotazione

Quando qualcuno prenota una call, deve essere rimosso automaticamente dalla sequenza email in ConvertKit.

### Requisiti
- Account **Zapier** (piano gratuito sufficiente per iniziare)
- **Calendly** con webhook attivi (piano Essentials o superiore)
- **ConvertKit** con accesso API

---

### Step 1 — Configurare il webhook su Calendly

1. Vai su **Calendly → Integrations → Webhooks**
2. Clicca **+ Create New Webhook**
3. Inserisci l'URL del tuo **Zapier Catch Hook** (vedi Step 2)
4. Seleziona evento: `invitee.created`
5. Seleziona il tipo di evento: il tuo evento da 30 minuti
6. Salva

---

### Step 2 — Creare lo Zap in Zapier

**Trigger:**
- App: `Webhooks by Zapier`
- Event: `Catch Hook`
- Copia l'URL generato → incollalo nel webhook Calendly (Step 1)
- Testa il trigger prenotando un appuntamento di test su Calendly

**Action:**
- App: `ConvertKit`
- Event: `Remove Tag from Subscriber`
- Account: collega il tuo account CK
- Email: mappa `{{invitee_email}}` dal payload Calendly
- Tag: `in-sequenza-vsl`

**Attiva lo Zap.**

---

### Verifica automazione

1. Iscriviti al form di test → verifica che il tag `in-sequenza-vsl` sia applicato in CK
2. Prenota un appuntamento di test su Calendly con la stessa email
3. Attendi 1-2 minuti → verifica in CK che il tag sia stato rimosso

---

## 4. Video VSL — dove inserirlo

In `vsl.html`, trova il commento `EMBED VIDEO` e scegli:

| Player | Consigliato per |
|---|---|
| **Wistia** | Massima personalizzazione, analytics avanzate |
| **Vimeo Pro** | No ads, buona qualità, più economico |
| **Bunny Stream** | Ottimo rapporto qualità/prezzo, CDN veloce |
| **File MP4** | Test locali o hosting su proprio server/CDN |

> ⚠️ Non usare YouTube — gli annunci distraggono e abbassano la conversione.

### Impostare il tempo di reveal CTA

In `vsl.html`, modifica la variabile:
```js
const REVEAL_AT = 900; // secondi
```
Imposta il numero di secondi dopo il quale appare la CTA (es. 900 = 15 minuti).

> **Per testare**: cambia a `5` temporaneamente — la CTA appare dopo 5 secondi.
> **In produzione**: rimuovi la riga `setTimeout(showCTA, 4000)` che è solo per test con placeholder.

---

## 5. Deploy (quando sei pronto)

Tutte le pagine sono HTML/CSS/JS puri — nessun server richiesto.

**Netlify (drag & drop):**
1. Vai su **netlify.com → Add new site → Deploy manually**
2. Trascina la cartella `Vsl_Lifter_House/` sulla zona di upload
3. Netlify assegna un URL gratuito (es. `xyz.netlify.app`)
4. Per dominio custom: Sites → Domain settings → Add custom domain

**Vercel:**
```bash
npm i -g vercel
cd "Funnel Builder/Vsl_Lifter_House"
vercel
```

**Cloudflare Pages:**
1. Connetti il repo GitHub (o upload diretto)
2. Build command: vuoto (static site)
3. Output directory: `/`
