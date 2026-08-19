# UX — Waka Tourisme V1

## Arborescence

```text
/
├─ /explorer
├─ /surprise
├─ /destinations
│  └─ /destinations/[slug]
├─ /activites
│  └─ /activites/[id]
├─ /favoris
├─ /voyages
├─ /profil
├─ /auth
│  ├─ /auth/callback
│  └─ /auth/nouveau-mot-de-passe
├─ /partenaires
├─ /confidentialite
├─ /cgu
├─ /offline
└─ /admin
```

## Navigation mobile

- Accueil
- Explorer
- Surprise
- Favoris
- Profil

## Parcours signature

### Surprends-moi

1. départ ;
2. temps disponible ;
3. profil de voyageurs ;
4. budget ;
5. transport ;
6. enfants ;
7. envies facultatives ;
8. scoring + tirage ;
9. révélation ;
10. trajet ;
11. fiche ;
12. programme ;
13. favori / sauvegarde / nouvelle destination.

Le résultat reste utilisable même sans animation.

## Parcours autour de moi

1. ville ou géolocalisation ponctuelle ;
2. rayon ;
3. catégories ;
4. POI classés par proximité ;
5. durée routière lorsque disponible ;
6. vue carte ;
7. lien vers la source OSM lorsque disponible.

## Principes

- compte facultatif avant sauvegarde/synchronisation ;
- incertitude explicite plutôt que précision inventée ;
- état vide, erreur ou fournisseur indisponible toujours traité ;
- CTA importants dimensionnés pour mobile ;
- ton adulte, chaleureux, sans folklore cliché.
