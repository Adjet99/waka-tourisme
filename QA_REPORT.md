# Rapport QA de livraison — Waka Tourisme V1

Date de contrôle : 19 août 2026.

## Contrôles passés

- ✅ 72 fichiers TypeScript/TSX parsés, 0 erreur de syntaxe.
- ✅ 0 import local `@/...` manquant.
- ✅ `package.json` valide.
- ✅ icônes PWA présentes en 192×192, 512×512 et Apple Touch 180×180.
- ✅ moteur de recommandation : résultat disponible sans préférences.
- ✅ ville de départ exclue.
- ✅ destinations refusées exclues.
- ✅ tirage pondéré fonctionnel.
- ✅ mode courte durée renvoie des destinations admissibles.
- ✅ distance géodésique de contrôle Abidjan → Grand-Bassam : ~34 km avec les coordonnées du catalogue.
- ✅ catalogue dynamique Supabase avec fallback embarqué.
- ✅ routage dégradé sans durée inventée.
- ✅ endpoints publics avec validation/rate limiting de base.
- ✅ compte : export et suppression protégés par token utilisateur + service role serveur.

## Contrôle non exécutable dans l’environnement de génération

`npm install` n’a pas pu terminer car l’accès réseau au registre npm de cet environnement expire. Par conséquent, le build Next.js complet et les tests Vitest via les dépendances npm doivent obligatoirement être relancés sur la machine de recette ou en CI :

```bash
npm install
npm run check
npm run build
```

Ne pas considérer un déploiement public comme validé tant que ces trois commandes n’ont pas réussi.

## Recette fonctionnelle recommandée

Voir `DEPLOYMENT_VERCEL.md` pour la checklist de 20 scénarios après déploiement HTTPS.

## Points restant hors du logiciel

- validation juridique ;
- licences médias ;
- revalidation des contenus touristiques ;
- fournisseurs API dimensionnés pour la charge ;
- domaine/SMTP/support ;
- recette appareils réels.

Voir `PRODUCTION_CHECKLIST.md`.
