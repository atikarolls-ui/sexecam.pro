# Firebase Auth — Guide d'utilisation

Ce dossier contient un exemple minimal d'intégration Firebase Authentication côté client (inscription, connexion, vérification d'email, réinitialisation de mot de passe, contrôle d'âge, acceptation des CGU).

⚠️ Important : tu dois créer un projet Firebase et récupérer la configuration web (apiKey, authDomain, ...). Les étapes ci-dessous expliquent comment faire.

## Étapes pour créer et configurer le projet Firebase

1. Va sur https://console.firebase.google.com/ et connecte-toi avec ton compte Google.
2. Crée un nouveau projet (ou utilise-en un existant).
3. Dans le panneau du projet → clique sur "Authentication" → onglet "Sign-in method" et active "Email/Password".
4. Dans la roue crantée (⚙️) → "Project settings" → onglet "General" → section "Your apps" → ajoute une Web app si tu n'en as pas.
5. Copie l'objet `firebaseConfig` (apiKey, authDomain...) : tu en auras besoin pour l'exemple.

## Installer / tester localement

Tu peux servir ces fichiers statiques localement :

- avec Python 3 (rapide) :

```bash
python3 -m http.server 8000
# ouvrir http://localhost:8000/firebase-auth/
```

- ou avec un petit serveur Node (si tu préfères) :

```bash
npm install -g http-server
http-server -c-1
# ouvrir l'URL affichée, puis /firebase-auth/
```

## Où mettre la config Firebase

1. Dans la console Firebase (Project settings → Your apps → Config), copie l'objet `firebaseConfig` de ta Web app.
2. Duplique `firebase-auth/config.example.js` en `firebase-auth/config.js` et colle la config à l'intérieur (ne commite pas `config.js`; il est inclus dans `.gitignore`).

Exemple :

```js
// firebase-auth/config.js
export const firebaseConfig = {
	apiKey: "...",
	authDomain: "...",
	projectId: "...",
	// ...
};
```

## Test rapide (smoke test)

Un script très simple a été ajouté pour vérifier que la page `index.html` est servie et contient le texte d'en-tête. Pour l'utiliser :

```bash
# depuis la racine du dépôt
python3 -m http.server 8000 &
chmod +x firebase-auth/test-smoke.sh
firebase-auth/test-smoke.sh
```

Le test renverra `OK: ...` s'il détecte la page et la chaîne attendue.

## Déploiement automatique (GitHub Pages)

J'ai ajouté un workflow GitHub Actions pour déployer automatiquement le dossier `firebase-auth/` sur GitHub Pages après chaque push sur `main`.

Remarque : GitHub Actions utilise `GITHUB_TOKEN` automatiquement, il n'est donc pas nécessaire de configurer de secret pour un déploiement de base sur GitHub Pages. Après un push sur `main` l'action :

- démarre un serveur simple pour effectuer un smoke-test (vérifie le rendu de `index.html`),
- si le test passe, publie `firebase-auth/` sur la branche `gh-pages` (GitHub Pages).

Après déploiement, ton site sera disponible sur `https://<owner>.github.io/<repo>/firebase-auth/` (ou via tes paramètres GitHub Pages).

## Fonctionnalités fournies

- Inscription (email + mot de passe + confirmation) avec envoi d'un email de vérification.
- Connexion et déconnexion.
- Affichage du statut de vérification de l'email.
- Réinitialisation de mot de passe via email.
- Validation d'âge (case à cocher "J'ai 18 ans ou plus") et acceptation des CGU pendant l'inscription.

---

Si tu veux, je peux :
- ajouter une intégration côté serveur (ex: Node/Express) pour gérer des règles strictes, ou
- déployer un exemple sur Vercel/Netlify et tester avec un vrai Firebase.

Dis‑moi si tu préfères que je fasse l'étape de création du projet Firebase et que j'ajoute la configuration directement dans le dépôt (je ne peux pas créer ton projet Firebase pour toi, mais je peux fournir tous les fichiers et les étapes automatiques).