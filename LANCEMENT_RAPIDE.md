# Lancement rapide de Waka Tourisme V1

## Test immédiat sur Windows

1. Installer Node.js LTS.
2. Décompresser le projet.
3. Ouvrir le dossier dans Visual Studio Code.
4. Ouvrir **Terminal > Nouveau terminal**.
5. Exécuter :

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

6. Ouvrir :

```text
http://localhost:3000
```

Ce mode permet de tester immédiatement : accueil, Explorer, Surprends-moi, destinations, météo, routage, itinéraires, favoris, voyages locaux, PWA et formulaires en mode démo.

## Test sur téléphone via le même Wi-Fi

```powershell
npm run dev -- --hostname 0.0.0.0
ipconfig
```

Repérer l’IPv4 du PC, par exemple `192.168.1.35`, puis ouvrir sur le téléphone :

```text
http://192.168.1.35:3000
```

La géolocalisation navigateur peut exiger HTTPS selon le navigateur. Pour un test complet de géolocalisation/PWA, privilégier le déploiement Vercel HTTPS.

## Activer toutes les fonctions persistantes

Créer Supabase puis exécuter :

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_production_hardening.sql`
3. `supabase/seed.sql`

Renseigner ensuite `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Redémarrer `npm run dev`.

## Fonctions qui deviennent alors testables

- compte email ;
- Google OAuth si configuré ;
- mot de passe oublié ;
- synchronisation favoris ;
- synchronisation profil/passeport ;
- voyages multi-appareils ;
- refus récents de destinations ;
- analytics ;
- feedback bêta persistant ;
- demandes partenaires persistantes ;
- export/suppression de compte ;
- back-office réel.

## Administrateur

Créer d’abord un compte, puis dans Supabase SQL Editor :

```sql
update public.profiles p
set role='admin'
from auth.users u
where p.id=u.id
and u.email='VOTRE_EMAIL';
```

Ouvrir ensuite :

```text
http://localhost:3000/admin
```

## Mise en ligne

Voir `DEPLOYMENT_VERCEL.md`.
