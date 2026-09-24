# Handoff: KoraZone — application mobile iOS (direction « plein écran photo »)

## Overview
KoraZone (korazone.store) sells football-jersey reproductions in Morocco, cash on delivery. This
bundle covers the **mobile app** for customers: browsing the six-model 26/27 series, holding a size,
and placing an order paid to the courier — plus the two features that justify installing the app
(size help and an integrated WhatsApp thread).

The commercial intent drives the design: the app must **not** compete on price. The product sold is
the *Édition Vérifiée* — a checked garment, a named guarantee (« Garantie Colis Ouvert »), human
size help, a 7-day size exchange. The price appears **after** the value and is phrased as an amount
paid to the courier, never as a tag.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype of the
intended look and behaviour, **not production code to copy**. The task is to **recreate these
designs in the target codebase** with its own framework, component structure and conventions (React
Native, Swift/SwiftUI, Flutter, or a mobile web app). If no app codebase exists yet, pick the most
appropriate environment and implement the design there.

`KoraZone App.dc.html` is a comparison board: it contains three turns of options in one file.
**Turn 3 (`3a`, `3b`) is the selected direction and the scope of this handoff.** Turn 2 (`2a`, `2b`)
holds the premium/scarcity exploration the wording comes from, and turn 1 (`1a`–`1f`) holds the
first round (tab-bar home, classic form, size helper, WhatsApp thread). Turns 1 and 2 are kept as
reference for patterns that are not yet drawn in turn 3 — read them, but implement turn 3.

## Fidelity
**High fidelity.** Colours, fonts, sizes, weights, letter-spacing, radii, hairlines and interaction
states are final and listed below with exact values. Frames are drawn at **402 × 874 px**
(iPhone 16 logical size); the status bar occupies the top 62 px and the home indicator the bottom
34 px.

What is *not* final: the app icon and splash, the tab/section architecture beyond the two screens
below, the cart and order-tracking screens (not drawn — ask before inventing them), and every
number marked as demo data (stock counts, cut-off hour, order reference).

---

## Screens / Views

### 3a — Home: full-screen jersey feed + immersive product sheet

**Purpose.** One jersey fills the screen. The customer swipes vertically through the closed 26/27
series, reads the promise (checked, opened before payment, 7-day exchange), sees how many pieces are
left, and reserves a size.

**Layout.** Full-bleed vertical feed, `scroll-snap-type: y mandatory`, one 874 px-tall
`scroll-snap-align: start` card per product. Photo `object-fit: cover` (implemented as a
`background-image` + `background-size: cover` block so a missing photo never logs a failed request).
Background under the photo: `#0E1116`.

Per-card scrim (bottom-heavy, carries all text contrast):
`linear-gradient(to bottom, rgba(14,17,22,.72) 0, rgba(14,17,22,.25) 20%, rgba(14,17,22,.35) 48%, rgba(14,17,22,.96) 82%)`

Persistent top plate (behind wordmark / filters / cut-off, so text stays legible over white shirts):
height 214 px, `linear-gradient(to bottom, rgba(14,17,22,.92) 0, rgba(14,17,22,.88) 60%, rgba(14,17,22,.82) 78%, rgba(14,17,22,0) 100%)`, `pointer-events: none`.

Content is inset **58 px from the left** to clear the WhatsApp rail (see *Left rail*), 22 px on the
right.

**Components (top to bottom)**

1. **Wordmark** — `top: 62px`, `padding: 6px 22px 0 58px`. Text “KoraZone”, Syne 800, 20 px,
   line-height 1, letter-spacing −0.02em, `#FBFAF7`; the **Z is `#C9A24A`**. Right of the row:
   `ÉDITION VÉRIFIÉE`, Manrope 600, 9.5 px, uppercase, letter-spacing 0.16em, `#C9A24A`.
2. **Club filters** — `top: 100px`, horizontal scroller (hidden scrollbar), 8 px gap.
   Chips: `padding: 9px 15px`, `border-radius: 999px`, Manrope 600, 11.5 px, letter-spacing 0.04em.
   Inactive: border `1px rgba(251,250,247,.4)`, fill `rgba(14,17,22,.55)`, text `#FBFAF7`.
   Active: fill `#FBFAF7`, text `#14171C`, border `#FBFAF7`. Labels: `Tous · Barça · Real Madrid · Bayern`.
3. **Cut-off pill** — `top: 144px`. Solid `#14171C` pill, border `1px rgba(201,162,74,.4)`,
   `border-radius: 999px`, `padding: 6px 11px`. Line 1 of copy in Manrope 500, 10.5 px, `#FBFAF7`;
   the value in Manrope 700, 10.5 px, `#C9A24A`. Before 18:00 → `Commandes du jour closes dans` +
   `4 h 12`; after → `Prochaine clôture des commandes :` + `demain 18h`. **Solid fill is required**:
   a translucent version failed contrast over the white Bayern and Real shirts.
4. **Progress dots** — right edge, `right: 16px`, vertically centred, 4 px wide bars, 6 px gap;
   active 18 px `#FBFAF7`, inactive 8 px `rgba(251,250,247,.35)`.
5. **Card block** — `left: 58px; right: 22px; bottom: 0; padding-bottom: 44px`.
   - Scarcity line: 5 × 5 px `#C9A24A` square + `RESTE 2 PIÈCES · SÉRIE CLOSE`, Manrope 700, 9.5 px,
     uppercase, letter-spacing 0.18em, `#C9A24A`.
   - Meta: `FC BARCELONE · 26/27`, Manrope 600, 10 px, uppercase, letter-spacing 0.16em,
     `rgba(251,250,247,.72)`.
   - Title: Syne 800, 34 px, line-height 1.02, letter-spacing −0.03em, `#FBFAF7`, `text-wrap: pretty`.
   - Promise list: separated from the title by `border-top: 1px rgba(251,250,247,.22)`, 14 px above,
     7 px between rows; Manrope 500, 12.5 px, `rgba(251,250,247,.88)`. Rows: `Contrôlé pièce par
     pièce à Oujda` / `Colis ouvert devant le livreur, payé après` / `Échange de taille sous 7 jours`.
   - Price: Syne 800, 27 px, letter-spacing −0.03em, `#FBFAF7`, followed by `tout compris, réglés au
     livreur`, Manrope 500, 12 px, `rgba(251,250,247,.7)`.
   - Buttons, 10 px gap, 18 px above: primary `Réserver ma taille` — fill `#FBFAF7`, text `#14171C`,
     Manrope 700, 13.5 px, letter-spacing 0.02em, radius 8 px, min-height 52 px, flex 1.
     Secondary `Détails` — transparent, border `1px rgba(251,250,247,.45)`, text `#FBFAF7`,
     Manrope 600, 13 px, radius 8 px, `padding: 0 18px`.

**Immersive product sheet** (replaces the feed when a card is opened)

- Photo band: 452 px tall, same background-image technique, scrim
  `linear-gradient(to bottom, rgba(14,17,22,.6) 0, rgba(14,17,22,.05) 34%, rgba(14,17,22,.55) 100%)`.
- Back button: `top: 70px; left: 52px`, 44 × 44 px circle, border `1px rgba(251,250,247,.4)`,
  fill `rgba(14,17,22,.5)`, glyph `←` 19 px `#FBFAF7`.
- Stock badge: `top: 70px; right: 16px`, `padding: 9px 12px`, border `1px rgba(201,162,74,.6)`,
  fill `rgba(14,17,22,.55)`, text `RESTE 2 PIÈCES`, Manrope 700, 9 px, uppercase, ls 0.16em, `#C9A24A`.
- Over-photo title: `left: 58px; right: 22px; bottom: 34px`. Meta as above; product name Syne 800,
  30 px, line-height 1.03, letter-spacing −0.03em, `#FBFAF7`.
- **Paper sheet**: `margin-top: -18px`, `background: #FBFAF7`, `border-radius: 18px 18px 0 0`,
  scrolls internally, scrollbar hidden. Left padding 58 px, right 22 px.
  - Price row: Syne 800, 28 px, `#14171C` + `tout compris, réglés au livreur / après vérification du
    colis`, Manrope 500, 12.5 px, `#6B6F78`.
  - Intro paragraph: Manrope 400, 13.5 px, line-height 1.65, `#6B6F78`, `text-wrap: pretty`
    (per-product copy, verbatim from the content pack).
  - **Size grid** — eyebrow `PIÈCES RESTANTES`, Manrope 700, 10 px, uppercase, ls 0.2em, `#B9923C`;
    right link `Aide à la taille →`, Manrope 600, 11.5 px, `#B9923C`. Five equal buttons, 8 px gap,
    min-height 56 px, radius 3 px, `padding: 11px 0 9px`, column layout: size label Syne 700, 15 px;
    availability caption Manrope 600, 9 px, uppercase, ls 0.06em.
    States — default: border `#D8D4C9`, transparent fill, label `#14171C`, caption `#6B6F78` (`dispo`);
    low stock (≤ 2): caption `#A6183F` (`reste 2`);
    selected: fill `#14171C`, label `#FBFAF7`, caption `rgba(251,250,247,.7)`;
    sold out: border `#E2DFD6`, fill `#F1EFE9`, label + caption `#8B8F98` (`épuisée`), not selectable.
  - **Guarantee block** — box with `border: 1px #14171C`, `padding: 15px`, 14 px gap. 48 px circle,
    `border: 1px #B9923C`, inside `COLIS OUVERT` on two lines, Manrope 700, 7.5 px, ls 0.06em,
    `#B9923C`. Title `Garantie Colis Ouvert`, Syne 700, 13.5 px, `#14171C`; body Manrope 400, 12 px,
    line-height 1.55, `#6B6F78`: “Ouvrez devant le livreur. Rien ne vous convient : vous refusez,
    vous ne payez rien.”
  - **Hold panel** (after reserving) — `border: 1px #B9923C`, fill `#F1EFE9`, `padding: 15px`.
    Countdown Syne 800, 26 px, `#14171C`; caption Manrope 500, 11.5 px, `#6B6F78`: “Taille tenue pour
    vous avant remise en stock. Aucun paiement maintenant.”
  - **Footer bar** — `border-top: 1px #E2DFD6`, `padding: 12px 22px 26px 58px`. Primary button
    min-height 54 px, radius 8 px, Manrope 700, 14 px, text `#FBFAF7`; fill `#14171C` when a size is
    picked, `#8B8F98` when not. Label: `Choisissez une taille` → `Réserver la taille L` →
    `Continuer ma commande`. Note under it: Manrope 400, 11.5 px, `#6B6F78`, centred —
    “Réservation gratuite · appel de confirmation sous 24h”.

### 3b — Order: two questions over the same photo

**Purpose.** Complete the order without a cart: the reserved size is already known, so the app only
asks how to reach the customer and where to deliver, then shows the reference.

**Layout.** Same photo as background (`background-position: center 20%`) under
`linear-gradient(to bottom, rgba(14,17,22,.55) 0, rgba(14,17,22,.75) 30%, rgba(14,17,22,.97) 62%)`.
Column: status-bar spacer 62 px → header → reserved-item card → scrolling body → footer bar.
Left inset 52–72 px for the rail, 16–20 px right.

**Components**

1. **Header** — `padding: 4px 16px 12px 52px`. Back button 44 × 44 px, glyph `←` `#FBFAF7`.
   Progress: three 2 px bars, 4 px gap; done `#B9923C`, pending `rgba(251,250,247,.25)`.
   Right: `RÉSERVÉ 28:14` (live), Manrope 600, 10 px, uppercase, ls 0.14em, `rgba(251,250,247,.65)`.
2. **Reserved item card** — `margin: 6px 20px 0 58px`, `padding: 12px`,
   `border: 1px rgba(251,250,247,.22)`, fill `rgba(14,17,22,.5)`, 12 px gap.
   52 × 52 px photo; eyebrow `ÉDITION VÉRIFIÉE` Manrope 700, 9 px, ls 0.16em, `#C9A24A`;
   line `FC Barcelone domicile · Taille L` Syne 700, 13.5 px, `#FBFAF7`;
   `259 DH tout compris` Manrope 500, 11 px, `rgba(251,250,247,.65)`.
3. **Question** — Syne 800, 30 px, line-height 1.04, letter-spacing −0.03em, `#FBFAF7`;
   help text Manrope 400, 13.5 px, line-height 1.6, `rgba(251,250,247,.68)`.
   Step 1 `Comment vous joindre ?` · Step 2 `Où livrer le colis ?` · Step 3 `Votre taille est retenue`.
4. **Fields** — label Manrope 700, 10 px, uppercase, ls 0.14em, `rgba(251,250,247,.7)`.
   Input min-height 52 px, `padding: 12px 14px`, radius 3 px, border `1px rgba(251,250,247,.28)`,
   fill `rgba(251,250,247,.06)`, text Manrope 400, **16 px** (never below 16 px on iOS: it prevents
   the zoom-on-focus), colour `#FBFAF7`.
   Placeholders: `Le nom à communiquer au livreur`, `06 12 34 56 78`,
   `Quartier, rue, numéro, immeuble, étage…`. Phone help: “Les formats 06, 07 et +212 sont acceptés.”
   City chips: `padding: 12px 14px`, radius 3 px, Manrope 600, 13 px; inactive border `#D8D4C9` on
   transparent, active fill `#14171C` text `#FBFAF7`. Cities: Casablanca, Rabat, Marrakech, Oujda,
   Tanger, Fès, Autre ville.
5. **Totals** (step 2) — rows separated by `border-top: 1px rgba(251,250,247,.22)`;
   labels Manrope 500, 12.5 px, `rgba(251,250,247,.7)`; `offerte · 24 à 72h` Manrope 700, 12.5 px,
   `#FBFAF7`; total `259 DH` Syne 800, 22 px, `#FBFAF7`.
6. **Confirmation** (step 3) — box `border: 1px rgba(201,162,74,.5)`, fill `rgba(14,17,22,.5)`,
   `padding: 18px`. Eyebrow `RÉFÉRENCE` Manrope 700, 9.5 px, ls 0.18em, `#C9A24A`;
   reference Syne 800, 27 px, `#FBFAF7`; paragraph Manrope 400, 12.5 px, `rgba(251,250,247,.68)`.
7. **Footer bar** — `border-top: 1px rgba(251,250,247,.2)`, `padding: 12px 20px 26px 52px`.
   Button min-height 54 px, radius 8 px, Manrope 700, 14 px, `#FBFAF7` text; fill `#14171C` when the
   step is valid, `#8B8F98` otherwise. Labels: `Continuer` → `Commander — 259 DH à la réception` →
   `Revenir à la boutique`. Note: “Aucun paiement maintenant · colis vérifié avant règlement”.

### Left rail — WhatsApp ordering (both screens)

- Visible by default. `position: absolute; left: 0; top: 0; bottom: 0; width: 46px; z-index: 90`.
  Fill `rgba(14,17,22,.8)` with `backdrop-filter: blur(14px)` (and the `-webkit-` prefix),
  `border-right: 1px solid rgba(201,162,74,.35)`, `padding: 66px 0 40px`, items spaced
  `space-between`, centred.
- Top: collapse button, 26 px circle, border `1px rgba(251,250,247,.32)`, glyph `‹` `#FBFAF7`.
- Middle: link to `https://wa.me/212601122488` (new tab / native WhatsApp intent). Two vertical
  labels (`writing-mode: vertical-rl; transform: rotate(180deg)`), 12 px gap:
  `COMMANDER` Manrope 700, 8 px, uppercase, ls 0.2em, `#C9A24A`;
  `+212 601 122 488` Manrope 700, 11 px, ls 0.08em, `#FBFAF7`.
- Bottom: same link as a 30 px circle, border `1px rgba(201,162,74,.65)`, `WA` Manrope 700, 8.5 px,
  `#C9A24A`. Replace with the platform WhatsApp glyph if the app has an icon set.
- Collapsed: the rail is removed entirely and replaced by a reopen tab —
  `left: 0; top: 50%`, 22 × 58 px, `border-radius: 0 6px 6px 0`, border `1px rgba(201,162,74,.45)`
  (no left border), same blurred fill, glyph `›` `#C9A24A`.
- Page content keeps its 52–58 px left inset in both states (no reflow on toggle). On a real device
  raise the collapse button and the reopen tab to a 44 px hit area.

---

## Interactions & Behavior

- **Feed → sheet.** Tapping the card photo, `Réserver ma taille` or `Détails` opens the product
  sheet for that model. Back button returns to the feed.
- **Size selection.** Sold-out sizes are inert (no toast). Selecting a size updates the footer label
  and clears any previous reservation.
- **Reservation.** `Réserver la taille L` starts a **30-minute hold** (`Date.now() + 30 min`),
  reveals the hold panel and switches the footer to `Continuer ma commande`. The countdown ticks
  every second (`mm:ss`) and the hold expires client-side when it reaches 0 — server-side, the hold
  must actually block that unit or the scarcity claim becomes false.
- **Cut-off countdown.** Recomputed every second against 18:00 local. Under 6 h remaining it reads
  `Commandes du jour closes dans H h MM`; over 6 h it switches to `Prochaine clôture des
  commandes : demain 18h` and the confirmation note becomes “sous 24h” instead of “ce soir”.
- **Order flow (3b).** Step 1 requires name + phone, step 2 requires a city + address; the primary
  button stays `#8B8F98` and inert until the step is valid (no error text — the gate is the state).
  Step 3 is the confirmation; its button returns to the store.
- **WhatsApp rail.** Opens `https://wa.me/212601122488`. When the customer is on a product,
  pre-fill the thread with the pack's template: “Bonjour KoraZone, j'ai une question sur le maillot
  {nom_produit}, taille {taille}. Pouvez-vous m'aider ?”
- **Motion.** Feed is snap-scrolled, one card per gesture. Sheet enters from the bottom, 300–350 ms,
  `cubic-bezier(0.22,1,0.36,1)`. Hover/pressed states darken the fill only — no scale, no shadow.
  Honour `prefers-reduced-motion: reduce` by disabling the transitions.
- **Loading.** Photos use a flat `#F1EFE9` (light) or `#161A20` (dark) block — no spinner, no shimmer.
- **Empty / error.** Same surface, Manrope 15 px ink text, one outline button back to the feed.

## State Management

| State | Type | Notes |
|---|---|---|
| `feedIndex` | int | Snap position; drives the right-hand dots |
| `filter` | `'Tous' \| 'Barça' \| 'Real Madrid' \| 'Bayern'` | Client-side filter of the six models |
| `product` | product \| null | Open sheet; null = feed |
| `size` | `'S'…'XXL'` \| null | Cleared when the product changes |
| `stock[productId][size]` | int | **From the API.** 0 → sold out, ≤ 2 → low-stock caption |
| `holdUntil` | timestamp | 30-minute reservation; server-authoritative |
| `now` | timestamp | 1 s tick feeding both countdowns |
| `step` | 0 \| 1 \| 2 | Order flow |
| `name / phone / city / address` | string | Step validity is derived, not stored |
| `railOpen` | bool | Persist per user (the rail is a habit, not a session state) |
| `orderRef` | string | Returned by the order endpoint |

Everything else is presentational. The review aggregate (`4,8`, `4 avis clients`) comes from the
existing reviews source and is formatted with a **comma** decimal separator (French).

## Design Tokens

### Colour
| Token | Value | Use |
|---|---|---|
| `ink-deep` | `#0E1116` | App background behind photos (dark screens) |
| `ink` | `#14171C` | Primary fill, solid pills, selected size, sheet text |
| `ink-surface` | `#161A20` | Photo placeholder on dark, translucent card base |
| `ink-muted` | `#6B6F78` | Body copy on paper |
| `ink-faint` | `#8B8F98` | Disabled button fill, sold-out text, fine print |
| `paper` | `#FBFAF7` | Product sheet, text on ink, primary button on dark |
| `paper-inset` | `#F1EFE9` | Photo placeholder, hold panel, price block |
| `hairline` | `#E2DFD6` | 1 px dividers on paper |
| `hairline-strong` | `#D8D4C9` | Input and chip borders on paper |
| `gold` | `#B9923C` | Eyebrows, links, guarantee ring **on paper** |
| `gold-light` | `#C9A24A` | Same role **on ink** (raised for contrast) |
| `garnet` | `#A6183F` | Low-stock caption only |
| Overlays | `rgba(251,250,247,.88 / .72 / .7 / .65)` | Text on photo, in that order of importance |
| Rail | `rgba(14,17,22,.8)` + `blur(14px)` | Left rail and reopen tab |

Contrast rules that must survive re-implementation: white text over photography needs an effective
scrim of **α ≥ 0.8** (measured against the white Bayern and Real shirts); gold on photography does
not pass at all — it lives on a **solid** `#14171C` pill or on paper.

### Typography
- Display: **Syne** 700 / 800. Letter-spacing −0.02em (small) to −0.03em (large), line-height
  1.0–1.15, sentence case, never uppercase.
- Text / UI: **Manrope** 400 / 500 / 600 / 700, line-height 1.35–1.65.
- Eyebrow signature: Manrope 700, uppercase, letter-spacing 0.16–0.2em, gold.
- Scale used: 8 / 9 / 9.5 / 10 / 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 15 / 16 px text;
  22 / 26 / 27 / 28 / 30 / 34 px display. **Inputs never below 16 px.**
- Both fonts are OFL: `https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap` — self-host in production.

### Spacing
4 px base. Values in use: 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 22, 26, 34, 40, 44, 52,
58, 62, 66, 74.

### Radius
`3px` inputs, size buttons, small photos · `8px` buttons · `18px` sheet top corners · `999px` chips
and the cut-off pill · `50%` circles.

### Borders & shadows
1 px hairlines and the scrims carry all structure. **No shadows anywhere** (the shadow around each
frame belongs to the device mock, not the app).

## Assets
- Product photos supplied by the client, in `assets/`: `barca-domicile-1/-2/-3.jpeg`,
  `barca-exterieur.jpeg`, `barca-third.jpeg`, `real-domicile-1.jpeg`, `bayern-exterieur.jpeg`.
  Square-ish crops; the feed uses `cover` and centres them.
- **Missing:** a photo for *Maillot Real Madrid extérieur 2026/2027*. The prototype shows a striped
  placeholder for it — supply the photo before launch.
- No icon set is used. Glyphs: `←` `→` `‹` `›` `★` `·` `−` `✓`. If icons are introduced, use a thin
  1.5 px stroke line set (e.g. Lucide) in ink or gold, and replace the `WA` circle with the real
  WhatsApp mark.
- App icon / splash not designed.

## Copy
All French copy is verbatim from the client's rewrite pack (`KoraZone-content.json`,
`KoraZone-copy-fr.md`): product names, size table, shipping and payment wording, form labels, help
text and system messages. Keep `vous` throughout, `DH` in customer-facing copy and `MAD` in
structured data, and keep the unofficial-reproduction disclosure on every product surface:
“Reproduction non officielle. KoraZone est une boutique indépendante, sans affiliation avec les
clubs ou leurs équipementiers.”

## Honesty requirements for the scarcity mechanics
These are design decisions with legal and trust consequences — implement them against real data or
remove them:
- `RESTE n PIÈCES` must read live stock. The prototype uses demo values (3, 5, 2, 4, 1, 2 across the
  six models and `{S:5, M:3, L:2, XL:4, XXL:0}` per size).
- `SÉRIE CLOSE · réassort non garanti` must match the actual restocking policy.
- The 18:00 cut-off must be the real order cut-off, and the 30-minute hold must really hold the unit.
- `Contrôlé le 8 sept.` on the product photo must come from the QC record, not a static string.

## Added since the first handoff
- **Duo offer** in 3a/3b: a second jersey for 240 DH (499 DH for both). It shows as a banner on each feed card, as a checkbox block on the product sheet (pick the model and size), and as a one-tap upsell at the address step. Totals and CTAs switch to 499 DH.
- **WhatsApp rail**: now a compact 34 px pill at `top: 218px` (236 px in 3b), 80% ink with a 14 px blur. It holds the vertical phone number, the official WhatsApp mark on `#25D366`, and a language button (`ع` / `FR`). The collapse button hides it completely; a 16 × 44 px tab brings it back.
- **Club filters** show a round photo of each club's jersey. No club crests (trademark, and it would imply affiliation).
- **Turn 4 (4a/4b) — Darija, RTL**: a mirrored layout (rail on the right, dots on the left, arrows reversed) in Noto Kufi Arabic + IBM Plex Sans Arabic, with no letter-spacing or uppercase. The vocabulary is what Moroccan sellers use (طريكو, القياس, كوموندي, الخلاص عند الاستلام, garantie « شوف عاد خلّص »). 4b is one screen: name, phone, city, address, confirm. Have a native speaker proofread it.
- **Turn 5 (5a) — desktop 1440 × 900**: the jersey full-bleed on the left (rarity, promise, six-model strip); on the right, a 540 px paper panel carrying the whole flow (size → duo → reserve → delivery form → confirmation) without leaving the page.

## Files
- `KoraZone App.dc.html` — the design reference. **Turn 3 (`3a`, `3b`) is in scope**; turns 2 and 1
  are earlier options kept for reference.
- `ios-frame.jsx`, `support.js` — supporting files so the reference opens in a browser (fonts need a
  network connection).
- `assets/` — the client's product photos used by the reference.
- Open `KoraZone App.dc.html` directly in a browser; the board pans and zooms, and every frame is
  interactive (feed, size selection, reservation countdown, order steps, rail collapse).
