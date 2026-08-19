# Waka Tourisme — checklist avant lancement commercial

Cette checklist distingue la **bêta exploitable** livrée du lancement commercial public.

## A. Infrastructure — obligatoire

- [ ] Créer le projet Supabase de production.
- [ ] Appliquer `001_init.sql`, `002_production_hardening.sql` et `seed.sql`.
- [ ] Définir au moins un compte `admin`.
- [ ] Configurer les sauvegardes et alertes Supabase adaptées au plan choisi.
- [ ] Déployer sur Vercel avec les variables de production.
- [ ] Configurer un domaine HTTPS définitif.
- [ ] Ajouter les URLs définitives dans Supabase Auth.
- [ ] Configurer l’email transactionnel/SMTP si le volume le justifie.
- [ ] Vérifier la délivrabilité : inscription, confirmation, reset password.
- [ ] Remplacer le rate limiting mémoire si trafic multi-instance important.
- [ ] Ajouter monitoring d’erreurs et alerting avant campagne importante.

## B. Juridique / confiance — obligatoire

- [ ] Renseigner le nom réel de l’éditeur.
- [ ] Renseigner l’adresse/contact légal selon la structure exploitante.
- [ ] Faire valider CGU et politique de confidentialité par un professionnel compétent pour les marchés visés.
- [ ] Déterminer les obligations applicables en Côte d’Ivoire et, si des utilisateurs UE sont visés, le cadre RGPD pertinent.
- [ ] Définir durées de conservation des leads, analytics et feedback.
- [ ] Définir la base légale/consentement des communications marketing.
- [ ] Préparer une procédure de demande d’accès, correction et suppression.
- [ ] Vérifier les conditions d’usage, attribution et licences de chaque fournisseur externe.
- [ ] Ne pas utiliser les visuels de démonstration comme photos officielles des lieux.

## C. Données touristiques — obligatoire pour crédibilité commerciale

- [ ] Valider chaque destination publiée.
- [ ] Ajouter au moins 5 POI fiables par destination prioritaire.
- [ ] Ajouter `source_url`, date de dernière vérification et niveau de confiance.
- [ ] Vérifier coordonnées GPS.
- [ ] Vérifier accessibilité et contacts lorsqu’ils sont affichés.
- [ ] Vérifier horaires et prix avant de les afficher comme informations certaines.
- [ ] Constituer les données de transports locaux administrées lorsque l’API n’existe pas.
- [ ] Créer une procédure éditoriale de revalidation périodique.
- [ ] Remplacer les images de démonstration par des médias licenciés/partenaires.
- [ ] Ajouter crédit/licence photo lorsqu’exigé.

## D. Fournisseurs externes — avant montée en charge

- [ ] Valider l’usage d’OpenStreetMap et les obligations d’attribution.
- [ ] Valider les limites/conditions de l’instance Overpass utilisée.
- [ ] Remplacer ou contractualiser le routage si le serveur OSRM public n’est pas adapté au trafic.
- [ ] Valider le fournisseur météo et ses conditions commerciales.
- [ ] Définir les fallbacks et budgets mensuels API.

## E. Produit / QA

- [ ] `npm run check` passe sans erreur.
- [ ] `npm run build` passe dans l’environnement de CI.
- [ ] Recette mobile Android Chrome.
- [ ] Recette iPhone Safari.
- [ ] Recette desktop Chrome/Edge/Safari/Firefox selon cible.
- [ ] Tester réseau lent et hors connexion.
- [ ] Tester géolocalisation refusée.
- [ ] Tester APIs météo/routage/POI indisponibles.
- [ ] Tester un catalogue sans résultat.
- [ ] Tester inscription, connexion, reset, déconnexion.
- [ ] Tester suppression/export avec un compte test.
- [ ] Tester RLS avec deux utilisateurs différents.
- [ ] Tester qu’un utilisateur normal ne peut pas accéder aux données admin.
- [ ] Tester ajout d’une destination admin → apparition publique après activation.
- [ ] Tester sauvegarde favoris/voyages sur deux appareils.
- [ ] Tester accessibilité clavier et réduction des animations.
- [ ] Tester PWA installée.

## F. Commercial

- [ ] Définir qui vend quoi : affiliation, commission, mise en avant, abonnement B2B ou premium.
- [ ] Écrire les conditions commerciales partenaires.
- [ ] Définir l’étiquetage visible des contenus sponsorisés.
- [ ] Définir le processus de qualification des leads partenaires dans `/admin`.
- [ ] Définir tarifs, facturation et support avant première vente.
- [ ] Ajouter le paiement uniquement lorsqu’un modèle transactionnel est réellement activé.
- [ ] Ne jamais favoriser silencieusement une destination sponsorisée dans la roulette.

## G. Critère de passage en production

Le feu vert commercial peut être donné lorsque :

- l’infrastructure est stable ;
- les flux de compte sont testés ;
- les données publiées prioritaires sont sourcées ;
- les visuels sont licenciés ;
- les textes juridiques sont validés ;
- les fournisseurs API sont compatibles avec le volume attendu ;
- le support et le modèle commercial sont définis ;
- la recette de bout en bout est validée sur téléphone réel.
