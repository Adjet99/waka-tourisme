# Waka Tourisme — V1 complète de test commercial

Waka Tourisme est une web app mobile-first/PWA de découverte touristique en Côte d’Ivoire. Elle transforme une intention vague — « où partir ? » — en deux parcours actionnables : **Explorer autour de moi** et **Surprends-moi**.

Cette livraison est pensée pour deux usages :

1. **Mode démo immédiat** : l’application démarre sans compte externe et conserve les favoris/voyages sur l’appareil.
2. **Mode connecté** : Supabase active les comptes, la persistance multi-appareils, le back-office, les analytics, les leads partenaires, le feedback bêta, l’export et la suppression du compte.

> Important : le logiciel est prêt pour une bêta publique/privée et un test commercial. Un lancement payant à grande échelle nécessite encore la validation juridique, les contenus/licences médias, les données touristiques et les fournisseurs d’API de production listés dans `PRODUCTION_CHECKLIST.md`.

## Ce qui fonctionne réellement

### Voyageur

- accueil mobile-first et PWA installable ;
- ville de résidence avec autocomplétion ;
- géolocalisation facultative, utilisée ponctuellement sans stockage de la position GPS précise ;
- recherche de POI « autour de moi » via OpenStreetMap/Overpass ;
- filtres par rayon et type d’expérience ;
- carte Leaflet/OpenStreetMap ;
- matrice de distance/temps routier via OSRM ;
- moteur **Surprends-moi** avec scoring durée, distance, budget, intérêts, famille, nouveauté + hasard contrôlé ;
- exclusion des destinations refusées, y compris les refus récents d’un utilisateur connecté ;
- fiches destination SEO ;
- fiches activités structurées ;
- météo Open-Meteo ;
- estimation routière avec fallback qui n’invente jamais de durée ;
- générateur de programme de 1 à 7 jours, avec rythme et option enfants ;
- sauvegarde des voyages ;
- favoris ;
- passeport de villes visitées et badges ;
- partage d’une destination ;
- formulaire de feedback bêta.

### Compte

- création de compte email/mot de passe ;
- confirmation email selon la configuration Supabase ;
- connexion Google OAuth ;
- réinitialisation du mot de passe ;
- synchronisation favoris / profil / villes visitées / voyages ;
- export JSON des données ;
- suppression du compte ;
- fonctionnement invité sans compte.

### Back-office / business

- rôles `admin`, `editor`, `user` ;
- création de destinations en brouillon ;
- activation/désactivation ;
- statut de vérification et date de revue ;
- création d’attractions en brouillon ;
- consultation du catalogue ;
- dashboard : utilisateurs, favoris, itinéraires, leads, spins 30 jours et conversion spin → voyage ;
- formulaire « Devenir partenaire » ;
- qualification des leads (`new`, `contacted`, `qualified`, `won`, `lost`, `spam`) ;
- collecte de feedback bêta ;
- analytics produit côté serveur.

## Stack

- Next.js 16.3 / React 19 / TypeScript
- Tailwind CSS 4 + CSS applicatif
- Supabase PostgreSQL + Auth + RLS
- `@supabase/ssr` pour la session SSR/cookies
- Leaflet / react-leaflet
- OpenStreetMap / Overpass
- OSRM pour le routage de test
- Open-Meteo pour la météo
- Zod pour la validation d’API
- Vitest pour les tests unitaires

## Démarrage immédiat — mode démo

Prérequis : Node.js récent (recommandé : LTS) et npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sous PowerShell Windows :

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Puis ouvrir :

```text
http://localhost:3000
```

L’application fonctionne sans Supabase. Les fonctions qui nécessitent une vraie base indiquent explicitement qu’elles sont en mode démo.

## Activer le mode complet Supabase

1. Créer un projet Supabase.
2. Dans le SQL Editor, exécuter dans cet ordre :
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_production_hardening.sql`
   - `supabase/seed.sql`
3. Ajouter dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` est **strictement serveur**. Ne jamais la préfixer avec `NEXT_PUBLIC_` ni l’exposer dans le navigateur.

4. Dans Supabase Auth, ajouter les URL de redirection :

```text
http://localhost:3000/auth/callback
https://votre-domaine.fr/auth/callback
```

5. Pour Google OAuth, activer le provider Google dans Supabase et configurer le client OAuth correspondant.

## Créer le premier administrateur

Après création du compte, exécuter dans le SQL Editor Supabase avec l’email réel :

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and u.email = 'votre-email@example.com';
```

Puis ouvrir `/admin`.

## Variables d’environnement

Voir `.env.example`. Les variables essentielles pour une bêta connectée sont :

```env
NEXT_PUBLIC_APP_NAME=Waka Tourisme
NEXT_PUBLIC_APP_URL=https://votre-domaine.fr
NEXT_PUBLIC_SUPPORT_EMAIL=contact@votre-domaine.fr
NEXT_PUBLIC_LEGAL_PUBLISHER_NAME="Nom de la société"
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_BETA_MODE=true
```

## Déploiement Vercel

Le projet est compatible Vercel. Voir le guide détaillé : `DEPLOYMENT_VERCEL.md`.

Résumé :

```bash
npm install
npm run build
```

Puis importer le dépôt Git dans Vercel, ajouter les variables d’environnement et déployer.

## Architecture

```text
src/
  app/
    api/
      account/         # export / suppression compte
      analytics/       # événements produit
      catalog/         # catalogue public dynamique
      feedback/        # retours bêta
      itinerary/       # générateur de séjour
      matrix/          # matrice temps/distances
      nearby/          # Overpass / OSM
      partner-leads/   # acquisition B2B
      recommend/       # moteur Surprends-moi
      route/           # routage
      weather/         # météo
    activites/
    admin/
    auth/
    destinations/
    explorer/
    favoris/
    partenaires/
    profil/
    surprise/
    voyages/
  components/
  config/
  data/                # fallback embarqué
  hooks/
  lib/
    server/
    supabase/
  types/
supabase/
  migrations/
  seed.sql
tests/
```

Le catalogue public privilégie Supabase lorsqu’il est configuré et retombe automatiquement sur les données embarquées lorsque la base n’est pas disponible.

## Sécurité intégrée

- RLS sur les données utilisateur ;
- rôle admin/editor contrôlé côté base ;
- service-role uniquement dans les Route Handlers serveur ;
- validation Zod des entrées sensibles ;
- rate limiting applicatif de base ;
- honeypot sur les formulaires publics ;
- headers de sécurité HTTP ;
- export et suppression de compte authentifiés ;
- aucune position GPS précise enregistrée par défaut ;
- pages CGU et confidentialité à personnaliser juridiquement avant lancement public.

Pour une forte charge ou plusieurs instances serverless, remplacer le rate limiter mémoire par Upstash Redis, Vercel KV ou un équivalent partagé.

## Données touristiques et vérité produit

Waka ne doit pas présenter une information mouvante comme certaine sans preuve. Les tables prévoient notamment :

- `source`
- `source_url`
- `confidence`
- `verified`
- `last_verified_at`

Les visuels Unsplash embarqués servent uniquement à la démonstration de l’interface. Avant un lancement public commercial, utiliser des photos réellement représentatives, licenciées et correctement créditées.

## API publiques de démonstration

OpenStreetMap/Overpass, le serveur public OSRM et Open-Meteo conviennent au prototype/bêta légère. Avant une campagne commerciale importante, valider leurs conditions d’usage, quotas, attribution et disponibilité ou utiliser un fournisseur offrant des garanties adaptées.

## Vérifications incluses

- tests unitaires du moteur de recommandation et de géodistance ;
- exclusion des destinations refusées ;
- exclusion de la ville de départ ;
- fallback POI/routage/météo ;
- parsing TypeScript/TSX réalisé sur l’ensemble du projet lors de la livraison ;
- `npm run check` disponible pour la machine de déploiement.

## Commandes

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run test
npm run check
```

## Avant de vendre / promouvoir publiquement

Lire impérativement `PRODUCTION_CHECKLIST.md`. Les principaux éléments non automatisables dans le code sont : identité de l’éditeur, mentions légales/CGU validées, politique de confidentialité, licences photos, validation des données et transports locaux, domaine/email support, configuration Supabase, fournisseurs API adaptés au trafic et procédure de support client.
