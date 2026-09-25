/* KoraZone — données du site.
   Tout ce qui est marqué LIVE doit venir du stock / du back-office réel.
   null = donnée inconnue : les composants de rareté restent masqués. */
window.KZ = {
  wa: '212601122488',
  waDisplay: '+212 601 122 488',
  email: null, // [Email de contact — à fournir]
  price: 259, duoSecond: 240, duoTotal: 499,
  sizes: [
    { s: 'S', w: 46, l: 68 }, { s: 'M', w: 48, l: 70 }, { s: 'L', w: 50, l: 72 },
    { s: 'XL', w: 52, l: 74 }, { s: 'XXL', w: 54, l: 76 }
  ],
  cities: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Oujda', 'Autre ville'],

  /* LIVE — à brancher sur le stock réel. */
  live: {
    cutoff: null,          // ex. '18:00' → pastille « Commandes du jour closes dans… »
    lowThreshold: 3,       // « Reste n pièces » affiché seulement si n ≤ seuil
    stock: {               // ex. { S: 4, M: 0, L: 2, XL: 5, XXL: 1 } ; null = inconnu
      'barca-domicile': null, 'barca-exterieur': null, 'barca-third': null,
      'real-domicile': null, 'real-exterieur': null, 'bayern-exterieur': null
    },
    qcDate: {              // ex. '2026-09-12' (registre de contrôle qualité)
      'barca-domicile': null, 'barca-exterieur': null, 'barca-third': null,
      'real-domicile': null, 'real-exterieur': null, 'bayern-exterieur': null
    },
    reviews: {             // avis réels uniquement : { city, size, fit, text, photo, date }
      'barca-domicile': [], 'barca-exterieur': [], 'barca-third': [],
      'real-domicile': [], 'real-exterieur': [], 'bayern-exterieur': []
    }
  },

  products: [
    { slug: 'barca-domicile', club: 'FC Barcelone', clubKey: 'barca', clubShort: 'Barça', edition: 'Domicile',
      photos: [{ key: 'barca-domicile-1', shot: 'Face' }, { key: 'barca-domicile-2', shot: 'Autre vue' }, { key: 'barca-domicile-3', shot: 'Autre vue' }] },
    { slug: 'barca-exterieur', club: 'FC Barcelone', clubKey: 'barca', clubShort: 'Barça', edition: 'Extérieur',
      photos: [{ key: 'barca-exterieur', shot: 'Face' }] },
    { slug: 'barca-third', club: 'FC Barcelone', clubKey: 'barca', clubShort: 'Barça', edition: 'Third',
      photos: [{ key: 'barca-third', shot: 'Face' }] },
    { slug: 'real-domicile', club: 'Real Madrid', clubKey: 'real', clubShort: 'Real', edition: 'Domicile',
      photos: [{ key: 'real-domicile', shot: 'Face' }] },
    { slug: 'real-exterieur', club: 'Real Madrid', clubKey: 'real', clubShort: 'Real', edition: 'Extérieur',
      photos: [] },
    { slug: 'bayern-exterieur', club: 'Bayern Munich', clubKey: 'bayern', clubShort: 'Bayern', edition: 'Extérieur',
      photos: [{ key: 'bayern-exterieur', shot: 'Face' }] }
  ],
  clubs: [
    { key: 'all', label: 'Tous les clubs' },
    { key: 'barca', label: 'FC Barcelone', thumb: 'barca-domicile-1' },
    { key: 'real', label: 'Real Madrid', thumb: 'real-domicile' },
    { key: 'bayern', label: 'Bayern Munich', thumb: 'bayern-exterieur' }
  ],

  shots: ['Face', 'Dos', 'Blason, gros plan', 'Détail d’impression', 'Texture du tissu', 'Étiquette de col', 'À plat avec mètre ruban'],

  /* Détails produit : [libellé, valeur ou null, exemple attendu] */
  details: [
    ['Composition', null, '100 % polyester'],
    ['Tissu', null, 'Maille respirante'],
    ['Blason', null, 'Brodé ou thermocollé'],
    ['Impressions', null, 'Sponsor thermocollé'],
    ['Poids', null, '160 g en taille M'],
    ['Entretien', null, 'Lavage à 30 °C, à l’envers, sans sèche-linge']
  ],
  qcChecklist: null, // ex. ['Coutures', 'Blason', 'Impressions', 'Mesures à plat']

  extraFaq: {
    'Les produits': [
      { q: 'Quelle taille choisir ?', a: '<p>Mesurez un maillot qui vous va déjà, posé à plat : S 46 × 68 cm, M 48 × 70 cm, L 50 × 72 cm, XL 52 × 74 cm, XXL 54 × 76 cm (largeur × longueur). Une tolérance de 1 cm est possible.</p><p><a href="#/guide-des-tailles">Voir le guide des tailles</a></p>' },
      { q: 'Proposez-vous des tailles enfant ?', a: '<p class="ph-text">[Réponse à fournir par KoraZone : tailles enfant proposées ou non]</p>' },
      { q: 'Prenez-vous des commandes pour une équipe ?', a: '<p class="ph-text">[Réponse à fournir par KoraZone : commandes groupées, quantités, délais]</p>' },
      { q: 'Comment laver et entretenir le maillot ?', a: '<p class="ph-text">[Consignes d’entretien à fournir par KoraZone : ex. lavage à 30 °C, à l’envers, sans sèche-linge]</p>' }
    ],
    'La commande et la livraison': [
      { q: 'Puis-je commander sur WhatsApp ?', a: '<p>Oui. Le dernier bouton de la commande ouvre WhatsApp avec votre commande déjà rédigée : il vous suffit d’appuyer sur Envoyer. Vous pouvez aussi nous écrire directement au +212 601 122 488.</p>' }
    ]
  },

  /* Tableau « Données à fournir par KoraZone » */
  missing: [
    ['Stock par modèle et par taille (live)', 'Fiche produit (sélecteur de taille, pastille de rareté), vignettes, données structurées', '{ "barca-domicile": { "S": 4, "M": 0, "L": 2, "XL": 5, "XXL": 1 } }'],
    ['Heure limite des commandes du jour', 'Pastille d’en-tête, rubrique Livraison', '18:00'],
    ['Date du dernier contrôle qualité, par modèle', 'Fiche produit, rubrique L’Édition Vérifiée', '12/09/2026'],
    ['Points de contrôle avant expédition', 'Rubrique L’Édition Vérifiée', 'Coutures · Blason · Impressions · Mesures à plat'],
    ['Composition', 'Détails du produit', '100 % polyester'],
    ['Tissu', 'Détails du produit', 'Maille respirante'],
    ['Blason : brodé ou thermocollé', 'Détails du produit', 'Brodé'],
    ['Impressions', 'Détails du produit', 'Sponsor thermocollé'],
    ['Poids', 'Détails du produit', '160 g en taille M'],
    ['Consignes d’entretien', 'Détails du produit, FAQ', 'Lavage à 30 °C, à l’envers'],
    ['Photos : Real Madrid extérieur (toutes les vues)', 'Accueil, collection, fiche produit', 'JPEG ≥ 1400 px, fond neutre'],
    ['Photos : dos, blason, impression, tissu, étiquette, à plat avec mètre (6 modèles)', 'Galerie de chaque fiche', 'JPEG carré ≥ 1400 px'],
    ['Avis clients réels', 'Fiche produit, page Avis', 'Casablanca · taille L · « Taille conforme » · photo facultative'],
    ['Réponse : tailles enfant', 'FAQ', 'Oui, du 8 au 14 ans / Non'],
    ['Réponse : commandes pour une équipe', 'FAQ', 'À partir de 10 maillots, sur WhatsApp'],
    ['Email de contact', 'Contact, pied de page, mentions légales', 'contact@korazone.store'],
    ['Identité légale du vendeur (raison sociale, forme, RC, ICE, adresse)', 'Mentions légales, CGV', 'KoraZone SARL AU · RC Oujda 00000 · ICE 000000000000000'],
    ['Hébergeur du site', 'Mentions légales', 'GitHub Pages — GitHub Inc.'],
    ['Déclaration ou autorisation CNDP (loi 09-08)', 'Confidentialité', 'Récépissé n° D-000/2026'],
    ['Image de partage et favicon', 'Balises Open Graph', 'og-image 1200 × 630 px, favicon 512 px']
  ]
};
