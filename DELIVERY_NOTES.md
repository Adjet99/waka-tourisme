# Waka Tourisme V1 — état de livraison

## Niveau livré

**V1 complète pour bêta fonctionnelle et test commercial.**

Le logiciel n’est plus un simple MVP visuel : les parcours principaux sont reliés à des services, une base de données optionnelle/production, une couche d’authentification, de persistance, d’administration et de collecte business.

## Fonctionnalités implémentées

### Grand public

- ✅ Landing mobile-first / responsive
- ✅ PWA installable + écran offline
- ✅ Ville de résidence
- ✅ Géolocalisation facultative sans stockage GPS précis par défaut
- ✅ Explorer autour de moi
- ✅ Rayons 10 / 25 / 50 / 100 / 200 km
- ✅ Filtres d’expériences
- ✅ POI OpenStreetMap / Overpass
- ✅ Carte Leaflet / OSM
- ✅ Matrice OSRM distance / durée
- ✅ Surprends-moi avec scoring pondéré
- ✅ Prise en compte durée / budget / transport / profil / intérêts / enfants / nouveauté
- ✅ Part de hasard contrôlée
- ✅ Exclusion ville de départ
- ✅ Refus récents persistants pour utilisateurs connectés
- ✅ Catalogue Supabase dynamique avec fallback embarqué
- ✅ 16 destinations initiales Côte d’Ivoire
- ✅ Fiches destination SEO + JSON-LD
- ✅ Fiches activités
- ✅ Open-Meteo
- ✅ Routage OSRM + fallback sans durée inventée
- ✅ Générateur d’itinéraire 1–7 jours
- ✅ Rythme tranquille / équilibré / actif
- ✅ Favoris
- ✅ Mes voyages
- ✅ Passeport / villes visitées / badges
- ✅ Partage
- ✅ Feedback bêta

### Comptes et données

- ✅ Supabase SSR/cookies
- ✅ inscription email
- ✅ connexion email
- ✅ Google OAuth
- ✅ mot de passe oublié / réinitialisation
- ✅ synchronisation favoris
- ✅ synchronisation profil
- ✅ synchronisation villes visitées
- ✅ synchronisation itinéraires
- ✅ export des données
- ✅ suppression du compte
- ✅ RLS utilisateur

### Business / administration

- ✅ rôles admin/editor
- ✅ création/activation/désactivation/suppression destination
- ✅ contrôle de vérification destination
- ✅ création attraction en brouillon
- ✅ dashboard KPI
- ✅ formulaire partenaire
- ✅ pipeline simple de qualification des leads
- ✅ analytics produit serveur
- ✅ rate limiting de base
- ✅ formulaires anti-spam honeypot

## Migrations

À exécuter dans l’ordre :

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_production_hardening.sql`
3. `supabase/seed.sql`

## Validation effectuée dans l’environnement de génération

- ✅ Parse TypeScript/TSX : **72 fichiers analysés, 0 erreur de syntaxe** au dernier contrôle.
- ✅ Smoke test du moteur de recommandation : OK.
- ✅ Distance Abidjan → Grand-Bassam : ~34 km géodésiques dans le jeu de coordonnées.
- ✅ Exclusion de l’origine : OK.
- ✅ Exclusion des destinations refusées : OK.
- ✅ Tirage pondéré : OK.
- ✅ Mode courte durée : retourne des destinations admissibles.
- ⚠️ `npm install` n’a pas pu aller au terme dans l’environnement de génération à cause de l’accès réseau au registre npm ; le build complet doit donc être exécuté sur la machine de recette/CI connectée avant déploiement public.

## Ce qui reste externe au code avant vente publique

- validation juridique des CGU/confidentialité ;
- identité légale réelle de l’éditeur ;
- médias/licences photo ;
- revalidation terrain/officielle des données touristiques ;
- fournisseur de routage/POI dimensionné pour une montée en charge ;
- domaine, email support et SMTP ;
- modèle économique/conditions partenaires définitifs ;
- tests E2E sur appareils réels et CI.

Voir `PRODUCTION_CHECKLIST.md`.
