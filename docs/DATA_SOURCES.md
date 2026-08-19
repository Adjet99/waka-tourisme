# Stratégie de données

## MVP

- `cities.ts` : 16 destinations de démarrage avec coordonnées et contenus éditoriaux indicatifs.
- OpenStreetMap / Overpass : points d’intérêt dynamiques.
- OSRM : distances et durées routières pour la démonstration.
- Open-Meteo : météo actuelle et prévision courte.

## Règle éditoriale

Un champ touristique susceptible d’évoluer doit porter une provenance et, côté base, pouvoir stocker :

- source ;
- URL source ;
- niveau de confiance ;
- vérifié / non vérifié ;
- date de dernière vérification.

Les prix, horaires, transports interurbains et disponibilités ne doivent pas être « complétés » artificiellement.

## Production

Prévoir une phase de validation éditoriale avec sources institutionnelles, partenaires locaux et/ou collecte terrain avant de marquer les données comme `verified=true`.
