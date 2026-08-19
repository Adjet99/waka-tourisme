# Architecture fonctionnelle — Waka Tourisme V1

## Principe

Waka supprime l’effort de choix et transforme une intention en destination + logistique + programme.

```text
Accueil
 ├─ Résidence / position ponctuelle
 ├─ Explorer autour de moi
 │   ├─ Overpass → POI
 │   ├─ OSRM Table → distance / durée
 │   └─ Leaflet / OSM → carte
 └─ Surprends-moi
     ├─ durée / budget / transport / voyageurs / enfants / intérêts
     ├─ Recommendation Engine
     │   ├─ pertinence 78 %
     │   └─ surprise 22 %
     └─ destination
         ├─ route
         ├─ météo
         ├─ activité
         ├─ itinéraire
         ├─ favori
         └─ voyage sauvegardé
```

## Modes de données

### Démo

- catalogue embarqué ;
- favoris/voyages/passeport locaux ;
- APIs publiques avec fallbacks ;
- aucun faux compte serveur.

### Connecté

- Supabase PostgreSQL comme catalogue public prioritaire ;
- Supabase Auth ;
- RLS ;
- synchronisation utilisateur ;
- admin/editor ;
- analytics, leads et feedback via Route Handlers serveur + service role.

## Couche serveur

- `src/lib/server/catalog.ts` : catalogue dynamique + fallback.
- `src/lib/server/rate-limit.ts` : protection de base.
- `src/lib/supabase/server.ts` : client SSR.
- `src/lib/supabase/proxy.ts` + `proxy.ts` : rafraîchissement de session.

## Résilience

- Supabase indisponible/non configuré → fallback catalogue.
- Overpass indisponible → POI embarqués lorsqu’ils existent.
- OSRM indisponible → distance géodésique, jamais de durée inventée.
- météo indisponible → état explicite, la page continue de fonctionner.
- formulaire commercial sans service-role → réponse démo clairement signalée, pas de fausse persistance.

## Séparation des responsabilités

Les pages n’implémentent pas directement les fournisseurs externes. Les Route Handlers/adapters permettent de remplacer OSRM, Open-Meteo ou Overpass sans réécrire les parcours UX.
