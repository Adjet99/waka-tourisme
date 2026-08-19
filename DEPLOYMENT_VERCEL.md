# Déployer Waka Tourisme sur Vercel

## 1. Préparer le projet localement

```bash
npm install
cp .env.example .env.local
npm run check
npm run build
```

Sous Windows PowerShell :

```powershell
npm install
Copy-Item .env.example .env.local
npm run check
npm run build
```

## 2. Créer la base Supabase

Exécuter dans le SQL Editor, dans cet ordre :

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_production_hardening.sql`
3. `supabase/seed.sql`

Créer ensuite le premier compte et lui attribuer le rôle `admin` selon le README.

## 3. Mettre le projet sur GitHub/GitLab/Bitbucket

À la racine :

```bash
git init
git add .
git commit -m "Waka Tourisme V1"
```

Pousser le dépôt vers votre hébergeur Git.

Vérifier que `.env.local` et les secrets ne sont jamais commités.

## 4. Importer dans Vercel

- créer un nouveau projet Vercel ;
- importer le dépôt ;
- framework : Next.js (détecté automatiquement) ;
- Build Command : `next build` / valeur par défaut ;
- installer les variables d’environnement ci-dessous ;
- déployer.

## 5. Variables Vercel

Minimum recommandé :

```env
NEXT_PUBLIC_APP_NAME=Waka Tourisme
NEXT_PUBLIC_APP_URL=https://votre-url.vercel.app
NEXT_PUBLIC_SUPPORT_EMAIL=contact@votre-domaine.fr
NEXT_PUBLIC_LEGAL_PUBLISHER_NAME="Nom de l’éditeur"
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_MAP_PROVIDER=osm
ROUTING_PROVIDER=osrm
WEATHER_PROVIDER=open-meteo
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_BETA_MODE=true
```

Ne jamais rendre `SUPABASE_SERVICE_ROLE_KEY` publique.

## 6. Configurer Supabase Auth pour la nouvelle URL

Dans les paramètres URL/Auth Supabase :

```text
Site URL: https://votre-url.vercel.app
Redirect URL: https://votre-url.vercel.app/auth/callback
```

Ajouter également le futur domaine personnalisé.

Pour Google OAuth, reporter aussi les URL de callback exigées par Supabase dans la console Google Cloud.

## 7. Domaine personnalisé

Une fois le test validé :

- ajouter `waka...` ou votre domaine final dans Vercel ;
- mettre à jour `NEXT_PUBLIC_APP_URL` ;
- ajouter le domaine dans les URL autorisées Supabase ;
- redéployer.

## 8. Test de recette après déploiement

Tester au minimum :

1. accueil sur mobile ;
2. installation PWA ;
3. Explorer autour de moi ;
4. refus géolocalisation ;
5. Surprends-moi avec et sans filtres ;
6. relance d’une destination ;
7. page destination, météo et trajet ;
8. génération puis sauvegarde d’un itinéraire ;
9. inscription email ;
10. confirmation email ;
11. connexion Google ;
12. mot de passe oublié ;
13. favoris sur deux appareils ;
14. passeport ;
15. export des données ;
16. formulaire partenaire ;
17. feedback bêta ;
18. rôle admin et catalogue ;
19. analytics dashboard ;
20. suppression du compte sur un compte test.

## 9. Passage de bêta à production commerciale

Une URL Vercel fonctionnelle ne suffit pas à rendre le service juridiquement/commercialement prêt. Fermer les points de `PRODUCTION_CHECKLIST.md` avant acquisition payante ou vente de services partenaires.
