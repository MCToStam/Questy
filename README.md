# Questy

Questy est un bot Discord conçu pour fournir aux joueurs et aux membres de la communauté des informations liées au serveur Minecraft **EarthQuest**.

Grâce à son intégration avec les services d'EarthQuest, Questy permet d'accéder rapidement à différentes informations directement depuis Discord.

## 🌍 À propos d'EarthQuest

EarthQuest est un serveur Minecraft proposant une expérience immersive inspirée du monde réel.

➡️ Site officiel : https://www.earthquest.fr/

## ✨ Fonctionnalités

- 📊 Consultation d'informations du serveur EarthQuest
- 👥 Informations sur les joueurs
- 🏰 Données liées au serveur Minecraft
- 🤖 Commandes Discord simples et intuitives
- 🔄 Mise à jour des informations en temps réel

## 📦 Installation

### Prérequis

- Node.js 19 ou supérieur
- Un bot Discord créé sur le portail développeur Discord
- Un token de bot Discord

### Cloner le projet

```bash
git clone https://github.com/MCToStam/Questy.git
cd Questy
```

### Installer les dépendances

```bash
npm install
```

## ⚙️ Configuration

### 1. Configurer le fichier `.env` et `config.js`

Copiez le fichier d'exemple :

```bash
cp config.example.js config.js
cp .env.exemple .env
```

Puis complétez les différentes variables nécessaires.

### 2. Modifier le fichier `config.js`

Ouvrez le fichier :

```bash
config.js
```

et adaptez les paramètres à votre environnement :

- Identifiants Discord
- IDs des serveurs
- Paramètres personnalisés du bot

## 🚀 Démarrage

Pour lancer le bot, utilisez le fichier principal :

```bash
node main.js
```

Ou avec PM2 :

```bash
pm2 start main.js --name Questy
```

## 📁 Structure du projet

```text
.
├── main.js
├── config.js
├── .env
├── src/
    ├── commands/
    └── events/
└── utils
```

## 🤝 Contribution

Les contributions sont les bienvenues.

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Effectuez vos modifications
4. Ouvrez une Pull Request

## 📄 Licence

Ce projet est distribué sous la licence Apache License 2.0.

---

Développé par ToStam
