import type { Attraction, City } from '@/types';

const common = {
  active: true,
  source: 'Données de démarrage Waka + coordonnées de référence OSM/Nominatim à revalider avant production',
  verifiedAt: '2026-08-19'
};

export const cities: City[] = [
  {
    ...common, id: 'abidjan', name: 'Abidjan', slug: 'abidjan', region: 'District autonome d’Abidjan',
    latitude: 5.359952, longitude: -4.008256, minDays: 1, maxDays: 4, averageBudgetXof: 65000,
    tags: ['culture', 'gastronomie', 'urbain', 'famille', 'vie nocturne'],
    shortDescription: 'La métropole ivoirienne entre lagune, culture, gastronomie et énergie urbaine.',
    longDescription: 'Abidjan concentre une grande variété d’expériences : quartiers animés, patrimoine, espaces naturels, restaurants et sorties. C’est aussi le meilleur point de départ pour explorer le littoral.',
    heroImage: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Parc national du Banco', 'Musée des Civilisations de Côte d’Ivoire', 'Cathédrale Saint-Paul du Plateau']
  },
  {
    ...common, id: 'grand-bassam', name: 'Grand-Bassam', slug: 'grand-bassam', region: 'Sud-Comoé',
    latitude: 5.2118, longitude: -3.7388, minDays: 1, maxDays: 2, averageBudgetXof: 45000,
    tags: ['plage', 'culture', 'patrimoine', 'couple', 'famille'],
    shortDescription: 'Patrimoine, architecture coloniale, plage et douceur de vivre à moins de deux heures d’Abidjan.',
    longDescription: 'Grand-Bassam est une escapade emblématique du littoral ivoirien, appréciée pour son quartier historique, ses musées, ses plages et son rythme tranquille.',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Quartier France', 'Musée National du Costume', 'Plage de Grand-Bassam']
  },
  {
    ...common, id: 'assinie', name: 'Assinie', slug: 'assinie', region: 'Sud-Comoé',
    latitude: 5.133, longitude: -3.283, minDays: 1, maxDays: 3, averageBudgetXof: 85000,
    tags: ['plage', 'lagune', 'repos', 'couple', 'bateau'],
    shortDescription: 'Une destination balnéaire entre océan et lagune, idéale pour déconnecter.',
    longDescription: 'Assinie séduit par ses plages, ses paysages lagunaires et ses activités nautiques. Le niveau de budget varie fortement selon l’hébergement choisi.',
    heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Lagune d’Assinie', 'Plages d’Assinie', 'Excursion en bateau']
  },
  {
    ...common, id: 'bingerville', name: 'Bingerville', slug: 'bingerville', region: 'District autonome d’Abidjan',
    latitude: 5.3558, longitude: -3.8854, minDays: 1, maxDays: 1, averageBudgetXof: 25000,
    tags: ['nature', 'histoire', 'famille', 'excursion'],
    shortDescription: 'Une échappée verte et historique aux portes d’Abidjan.',
    longDescription: 'Bingerville permet de changer d’ambiance sans partir loin de la capitale économique, avec des sites de promenade et un patrimoine lié à l’histoire de la Côte d’Ivoire.',
    heroImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Jardin botanique de Bingerville']
  },
  {
    ...common, id: 'jacqueville', name: 'Jacqueville', slug: 'jacqueville', region: 'Grands-Ponts',
    latitude: 5.205, longitude: -4.414, minDays: 1, maxDays: 2, averageBudgetXof: 40000,
    tags: ['plage', 'lagune', 'repos', 'excursion'],
    shortDescription: 'Une destination littorale paisible pour la plage et les grands espaces.',
    longDescription: 'Jacqueville offre une alternative plus calme aux stations balnéaires les plus fréquentées, avec un environnement entre lagune et océan.',
    heroImage: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Plages de Jacqueville', 'Balades lagunaires']
  },
  {
    ...common, id: 'dabou', name: 'Dabou', slug: 'dabou', region: 'Grands-Ponts',
    latitude: 5.3256, longitude: -4.3768, minDays: 1, maxDays: 2, averageBudgetXof: 35000,
    tags: ['histoire', 'lagune', 'culture', 'excursion'],
    shortDescription: 'Une ville lagunaire à découvrir pour son histoire et son atmosphère locale.',
    longDescription: 'Dabou constitue une excursion accessible depuis Abidjan et permet de combiner patrimoine local, marchés et paysages lagunaires.',
    heroImage: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Fort de Dabou', 'Paysages lagunaires']
  },
  {
    ...common, id: 'grand-lahou', name: 'Grand-Lahou', slug: 'grand-lahou', region: 'Grands-Ponts',
    latitude: 5.1367, longitude: -5.0266, minDays: 1, maxDays: 3, averageBudgetXof: 50000,
    tags: ['nature', 'lagune', 'plage', 'aventure'],
    shortDescription: 'Entre lagunes, embouchure et villages, une destination nature encore confidentielle.',
    longDescription: 'Grand-Lahou est adaptée aux voyageurs attirés par les paysages aquatiques, les excursions et une expérience moins urbaine du littoral ivoirien.',
    heroImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Lahou-Kpanda', 'Lagune de Grand-Lahou']
  },
  {
    ...common, id: 'yamoussoukro', name: 'Yamoussoukro', slug: 'yamoussoukro', region: 'District autonome de Yamoussoukro',
    latitude: 6.8276, longitude: -5.2893, minDays: 1, maxDays: 2, averageBudgetXof: 45000,
    tags: ['architecture', 'culture', 'histoire', 'famille'],
    shortDescription: 'La capitale politique, connue pour ses monuments monumentaux et ses grandes avenues.',
    longDescription: 'Yamoussoukro se visite facilement sur un week-end et combine architecture, histoire contemporaine et espaces urbains très différents d’Abidjan.',
    heroImage: 'https://images.unsplash.com/photo-1520637836862-4d197d17c43a?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Basilique Notre-Dame de la Paix', 'Fondation Félix Houphouët-Boigny pour la recherche de la paix']
  },
  {
    ...common, id: 'bouake', name: 'Bouaké', slug: 'bouake', region: 'Gbêkê',
    latitude: 7.6906, longitude: -5.0300, minDays: 1, maxDays: 2, averageBudgetXof: 40000,
    tags: ['culture', 'gastronomie', 'urbain', 'marche'],
    shortDescription: 'Une grande ville du centre, vivante et commerçante.',
    longDescription: 'Bouaké constitue une étape importante vers le nord du pays, avec une forte identité urbaine, des marchés et une vie locale dynamique.',
    heroImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Grand marché de Bouaké']
  },
  {
    ...common, id: 'korhogo', name: 'Korhogo', slug: 'korhogo', region: 'Poro',
    latitude: 9.4580, longitude: -5.6296, minDays: 2, maxDays: 4, averageBudgetXof: 60000,
    tags: ['culture', 'artisanat', 'nature', 'aventure'],
    shortDescription: 'Arts, artisanat sénoufo et paysages du nord ivoirien.',
    longDescription: 'Korhogo est une destination majeure pour découvrir l’artisanat sénoufo, les villages spécialisés et les reliefs du nord de la Côte d’Ivoire.',
    heroImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Mont Korhogo', 'Village de tisserands de Waraniéné', 'Toiles peintes de Fakaha']
  },
  {
    ...common, id: 'man', name: 'Man', slug: 'man', region: 'Tonkpi',
    latitude: 7.4125, longitude: -7.5538, minDays: 2, maxDays: 4, averageBudgetXof: 65000,
    tags: ['montagne', 'cascade', 'nature', 'randonnee', 'aventure'],
    shortDescription: 'Montagnes, cascades et forêts : l’une des grandes capitales nature de Côte d’Ivoire.',
    longDescription: 'Man est idéale pour un séjour actif : randonnées, panoramas, cascades et découvertes culturelles. Les temps de déplacement locaux doivent être vérifiés selon la saison.',
    heroImage: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Dent de Man', 'Cascades de Man', 'Mont Tonkoui', 'Forêt sacrée des singes de Gbêpleu']
  },
  {
    ...common, id: 'daloa', name: 'Daloa', slug: 'daloa', region: 'Haut-Sassandra',
    latitude: 6.8774, longitude: -6.4502, minDays: 1, maxDays: 2, averageBudgetXof: 40000,
    tags: ['culture', 'gastronomie', 'local', 'marche'],
    shortDescription: 'Une grande ville de l’ouest et une porte d’entrée vers le Haut-Sassandra.',
    longDescription: 'Daloa convient à ceux qui souhaitent sortir des itinéraires touristiques classiques et découvrir une grande ville régionale ainsi que son environnement.',
    heroImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Marchés et vie locale de Daloa']
  },
  {
    ...common, id: 'san-pedro', name: 'San-Pédro', slug: 'san-pedro', region: 'San-Pédro',
    latitude: 4.7485, longitude: -6.6363, minDays: 2, maxDays: 4, averageBudgetXof: 70000,
    tags: ['plage', 'nature', 'repos', 'aventure'],
    shortDescription: 'Un grand port du sud-ouest entouré de plages et de paysages côtiers.',
    longDescription: 'San-Pédro offre un mélange de ville portuaire, de plages et d’excursions vers les grands espaces naturels du sud-ouest.',
    heroImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Plages de San-Pédro', 'Monogaga']
  },
  {
    ...common, id: 'sassandra', name: 'Sassandra', slug: 'sassandra', region: 'Gbôklè',
    latitude: 4.9500, longitude: -6.0833, minDays: 2, maxDays: 3, averageBudgetXof: 55000,
    tags: ['plage', 'patrimoine', 'nature', 'repos'],
    shortDescription: 'Une ville côtière historique entre plages, fleuve et vestiges anciens.',
    longDescription: 'Sassandra séduit par son cadre maritime, son histoire et son caractère plus discret. Les excursions locales gagnent à être organisées avec des acteurs sur place.',
    heroImage: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Ancien wharf de Sassandra', 'Plages de Sassandra']
  },
  {
    ...common, id: 'bondoukou', name: 'Bondoukou', slug: 'bondoukou', region: 'Gontougo',
    latitude: 8.0402, longitude: -2.8000, minDays: 2, maxDays: 3, averageBudgetXof: 50000,
    tags: ['culture', 'histoire', 'architecture', 'artisanat'],
    shortDescription: 'Une ville historique de l’est, réputée pour son patrimoine religieux et culturel.',
    longDescription: 'Bondoukou offre une autre lecture de l’histoire ivoirienne, avec un patrimoine urbain et religieux singulier et une forte identité locale.',
    heroImage: 'https://images.unsplash.com/photo-1524498250077-390f9e378fc0?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Patrimoine des mosquées de Bondoukou']
  },
  {
    ...common, id: 'abengourou', name: 'Abengourou', slug: 'abengourou', region: 'Indénié-Djuablin',
    latitude: 6.7297, longitude: -3.4964, minDays: 1, maxDays: 2, averageBudgetXof: 45000,
    tags: ['culture', 'histoire', 'gastronomie', 'nature'],
    shortDescription: 'La capitale de l’Indénié, entre patrimoine royal et région agricole.',
    longDescription: 'Abengourou est une destination culturelle et régionale intéressante pour découvrir l’est de la Côte d’Ivoire, ses traditions et son économie agricole.',
    heroImage: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80',
    highlights: ['Palais royal de l’Indénié']
  }
];

export const curatedAttractions: Attraction[] = [
  { id: 'banco', citySlug: 'abidjan', name: 'Parc national du Banco', category: 'nature', latitude: 5.391, longitude: -4.051, description: 'Grand espace forestier protégé au cœur de l’agglomération abidjanaise.', visitDurationMinutes: 180, priceLevel: 'inconnu', childFriendly: true, source: 'Référence publique à revalider', verified: false },
  { id: 'musee-civ', citySlug: 'abidjan', name: 'Musée des Civilisations de Côte d’Ivoire', category: 'culture', latitude: 5.336, longitude: -4.025, description: 'Collections consacrées aux cultures et patrimoines de Côte d’Ivoire.', visitDurationMinutes: 120, priceLevel: 'inconnu', childFriendly: true, source: 'Référence publique à revalider', verified: false },
  { id: 'cathedrale-st-paul', citySlug: 'abidjan', name: 'Cathédrale Saint-Paul du Plateau', category: 'architecture', latitude: 5.329, longitude: -4.024, description: 'Édifice religieux emblématique du Plateau.', visitDurationMinutes: 60, priceLevel: 'gratuit', source: 'Référence publique à revalider', verified: false },
  { id: 'quartier-france', citySlug: 'grand-bassam', name: 'Quartier France', category: 'patrimoine', latitude: 5.195, longitude: -3.736, description: 'Cœur historique de Grand-Bassam et secteur majeur du patrimoine urbain.', visitDurationMinutes: 150, priceLevel: 'gratuit', childFriendly: true, source: 'Référence publique à revalider', verified: false },
  { id: 'musee-costume', citySlug: 'grand-bassam', name: 'Musée National du Costume', category: 'culture', latitude: 5.195, longitude: -3.736, description: 'Musée consacré aux costumes et traditions vestimentaires.', visitDurationMinutes: 90, priceLevel: 'inconnu', source: 'Référence publique à revalider', verified: false },
  { id: 'basilique-yakro', citySlug: 'yamoussoukro', name: 'Basilique Notre-Dame de la Paix', category: 'architecture', latitude: 6.811, longitude: -5.296, description: 'Monument religieux majeur de Yamoussoukro.', visitDurationMinutes: 120, priceLevel: 'inconnu', childFriendly: true, source: 'Référence publique à revalider', verified: false },
  { id: 'mont-korhogo', citySlug: 'korhogo', name: 'Mont Korhogo', category: 'nature', latitude: 9.46, longitude: -5.64, description: 'Relief offrant une expérience de plein air à proximité de Korhogo.', visitDurationMinutes: 150, priceLevel: 'inconnu', source: 'Référence publique à revalider', verified: false },
  { id: 'dent-man', citySlug: 'man', name: 'Dent de Man', category: 'randonnee', latitude: 7.39, longitude: -7.55, description: 'Relief emblématique de la région de Man, apprécié des amateurs de randonnée.', visitDurationMinutes: 240, priceLevel: 'inconnu', source: 'Référence publique à revalider', verified: false },
  { id: 'cascades-man', citySlug: 'man', name: 'Cascades de Man', category: 'cascade', latitude: 7.406, longitude: -7.546, description: 'Site naturel populaire à proximité de Man.', visitDurationMinutes: 120, priceLevel: 'inconnu', childFriendly: true, source: 'Référence publique à revalider', verified: false },
  { id: 'palais-abengourou', citySlug: 'abengourou', name: 'Palais royal de l’Indénié', category: 'culture', latitude: 6.73, longitude: -3.50, description: 'Site culturel associé à la royauté de l’Indénié.', visitDurationMinutes: 90, priceLevel: 'inconnu', source: 'Référence publique à revalider', verified: false }
];

export const cityBySlug = (slug: string) => cities.find((city) => city.slug === slug);
