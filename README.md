# KoraZone — site responsive (handoff)

Static site: HTML, CSS and JS with no dependencies and no build step. Open `index.html` directly or publish the folder as-is on GitHub Pages.

```
site/
  index.html         shell: header, mobile menu, footer, WhatsApp rail, sticky bar, dialog
  css/style.css      one stylesheet: tokens, components, media queries
  js/content.js      French copy generated from KoraZone-copy-fr.md (do not edit by hand)
  js/data.js         products, facts, LIVE data (stock, cut-off, QC, reviews), placeholder table
  js/app.js          hash router, views, order flow, WhatsApp message
  assets/img/        7 photos, WebP + JPEG fallback (1000 × 1000)
```

**Deploy.** Put the contents of `site/` at the root of a repo, then Settings → Pages → `main` / `(root)`. The URL is `https://<account>.github.io/<repo>/`.

**Design board.** `KoraZone Site Board.dc.html` loads the real site in iframes: 26 pages × 6 widths, with no device frame.

## Routes
| Route | Page |
|---|---|
| `#/` | Home (full-screen hero + model strip; vertical feed below 768 px) |
| `#/maillots`, `#/maillots?club=barca\|real\|bayern` | Collection with filters |
| `#/maillot/{barca-domicile, barca-exterieur, barca-third, real-domicile, real-exterieur, bayern-exterieur}` | Product page (one template) |
| `#/commande?etape=taille\|contact\|adresse\|envoi\|confirmation` | Order flow (add `&demo=…` for demo data) |
| `#/guide-des-tailles`, `#/livraison`, `#/echanges`, `#/faq`, `#/contact`, `#/avis`, `#/duo`, `#/a-propos`, `#/guide-editions` | Content pages |
| `#/mentions-legales`, `#/cgv`, `#/confidentialite` | Legal pages (structure to complete) |
| `#/etats` | Every UI state, with demo data (not linked from the site) |
| `#/donnees` | « Données à fournir par KoraZone » table |

SEO: `<title>`, meta description, Product JSON-LD (price `259.00 MAD`; `availability` only when stock is known), BreadcrumbList and FAQPage are injected per route. Hash routes are not indexed like real URLs. For production, pre-render one HTML file per route (`/maillots/fc-barcelone-domicile-2026-2027/index.html`, matching the pack slugs) from the same `app.js` views.

## Breakpoints
| Width | Behaviour |
|---|---|
| ≥ 1440 | 1440 px container, 6-model strip on the hero |
| 1280–1439 | Nav + header cut-off pill + full number on the WhatsApp button. At 1280 × 720, above the fold on the product page: gallery, name, meta, price, sizes, duo, CTA |
| 1100–1279 | Full nav; the WhatsApp button reads « WhatsApp » |
| 1024–1099 | Menu button; product page in 2 columns; details open in 2 columns |
| 768–1023 | Horizontally scrolling hero strip; product page in 1 column with a swipeable gallery, accordions and a sticky bar |
| < 768 | Home = full-screen vertical feed (scroll-snap), sticky club filters; 1-column grids; forms full width |
| 360 | Minimum width tested; tap targets ≥ 44 px, inputs 16 px (no zoom on iOS) |

## Tokens
Ink `#0E1116` / `#14171C` / `#161A20` · paper `#FBFAF7` · inset `#F1EFE9` · hairlines `#E2DFD6` / `#D8D4C9` · muted text `#5F636C` · gold `#B9923C` (lines and decoration on paper), **gold text on paper `#846418`** (AA; `#B9923C` does not reach 4.5:1 on paper) · gold on ink `#C9A24A` · garnet `#A6183F` (errors, missing data) · WhatsApp `#25D366`.
Syne 700/800 (display, letter-spacing −0.025 em) · Manrope 400–700 (text, 15 px base). Radii 3 / 8 / 999 px. No shadows: structure comes from 1 px hairlines and photo scrims at α ≥ 0.8 behind text.

## Components
Header (logo, nav, cut-off pill, FR/ع language slot, WhatsApp) · full-screen mobile menu · compact WhatsApp rail (collapsible, stored in `localStorage kz-rail`) · club chips with a photo thumbnail · product card · hero strip · phone feed card · accordion (`<details>`, forced open ≥ 1024) · size selector (stock unknown / available / low / sold out) · duo block · price block · promises · disclosure · Garantie Colis Ouvert steps · reviews (real only, empty state) · size-help dialog with calculator · form fields with errors and an error summary · order summary · WhatsApp message preview · sticky bar · empty filter state · photo placeholder.

## Honesty rules applied
- **Rarity driven by data.** « Reste n pièces », « épuisée » and the cut-off pill read `KZ.live`. With `null` they render nothing (see `#/etats`).
- **No « commande reçue »** before the customer presses Send in WhatsApp. The confirmation screen says so and offers « Rouvrir WhatsApp » and « Copier le message ».
- **No invented facts.** Fabric, weight, QC date, checklist, reviews, child sizes, team orders and care instructions all appear as **[red bracketed placeholders]**.
- **No authenticity claims.** No crests as icons, no kit-maker technology names, no crossed-out prices or discount wording. The pack sentences mentioning « remise », « au lieu de 518 DH » or the cart were removed from the non-legal pages (4 paragraphs, 2 FAQ questions: « Combien coûtent trois maillots ? », « Faut-il saisir un code promo ? »). The legal pages keep the pack text verbatim, with a banner asking for it to be adapted to the WhatsApp order.
- **Disclosure, verbatim:** « Reproduction non officielle. KoraZone est une boutique indépendante, sans affiliation avec les clubs ou leurs équipementiers. » It appears on every product page, in the footer and in the order flow.

## Order flow
Size and duo → contact (06 or 07 + 8 digits, or +212) → address (city from a list, or « Autre ville ») → preview + « Envoyer ma commande sur WhatsApp » (`wa.me/212601122488?text=…`, reference `KZ-DDMM-NNNN`) → confirmation. The cart and the form are kept in `sessionStorage` (`kz-cart`, `kz-order`). On a computer, a note explains the WhatsApp Web fallback.

## Données à fournir par KoraZone
| Data | Where it appears | Expected format |
|---|---|---|
| Stock per model and per size (live) | Size selector, rarity pill, JSON-LD | `{ "barca-domicile": { "S": 4, "M": 0, "L": 2, "XL": 5, "XXL": 1 } }` |
| Daily order cut-off time | Header pill, Livraison section | `18:00` |
| Date of the last quality check, per model | L'Édition Vérifiée | `12/09/2026` |
| Pre-shipping checkpoints | L'Édition Vérifiée | `Coutures · Blason · Impressions · Mesures à plat` |
| Composition | Détails du produit | `100 % polyester` |
| Fabric | Détails du produit | `Maille respirante` |
| Crest: embroidered or heat-applied | Détails du produit | `Brodé` |
| Prints | Détails du produit | `Sponsor thermocollé` |
| Weight | Détails du produit | `160 g en taille M` |
| Care instructions | Détails du produit, FAQ | `Lavage à 30 °C, à l'envers` |
| Photos: Real Madrid extérieur (all views) | Home, collection, product page | JPEG ≥ 1400 px |
| Photos: back, crest, print, fabric, label, flat lay with tape measure (6 models) | Product gallery | Square JPEG ≥ 1400 px |
| Real customer reviews | Product page, Avis page | `Casablanca · L · « Taille conforme »` + optional photo |
| Answer: child sizes | FAQ | `Oui, du 8 au 14 ans` / `Non` |
| Answer: team orders | FAQ | `À partir de 10 maillots, sur WhatsApp` |
| Contact email | Contact, legal notice | `contact@korazone.store` |
| Legal identity (company name, legal form, RC, ICE, address) | Mentions légales, CGV | `KoraZone SARL AU · RC Oujda 00000 · ICE …` |
| Website host | Mentions légales | `GitHub Pages — GitHub Inc.` |
| CNDP declaration or authorisation (law 09-08) | Confidentialité | `Récépissé n° D-000/2026` |
| Share image and favicon | Open Graph | 1200 × 630 px, 512 px |

The same table is generated from `KZ.missing` on the `#/donnees` page.
