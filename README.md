👵 La cuisine de grand-mère
Une application web chaleureuse pour gérer vos recettes de famille, développée avec une architecture Full-Stack JavaScript .

📁 Structure du projet
D'après l'organisation de mon environnement de développement :

app.js: Point d'entrée de l'application et configuration du serveur Express.

models/: Contient les schémas Mongoose pour la base de données MongoDB.

views/: Dossier contenant les templates EJS (ex: ingredients.ejs, receipe.ejs) pour le rendu côté serveur.

public/: Fichiers statiques (CSS, images, scripts côté client).

node_modules/: Dépendances du projet installé via npm.

🛠️ Technique d'empilement
Côté serveur : Node.js et Express.js

Interface utilisateur : EJS (JavaScript intégré), Bootstrap 4.4.1 (via CDN), FontAwesome

Base de données : MongoDB & Mongoose

Outils : Git, VS Code

⚙️ Installation rapide
Cloner le dépôt :

Frapper
git clone https://github.com/ThCluster/Grandma-Cooking.git
Installer les modules :

Frapper
npm install
Lancer le projet :

Frapper
node app.js
