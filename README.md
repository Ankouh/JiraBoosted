# Jira Boosted

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/votre-username/jira-boosted)
[![Licence](https://img.shields.io/badge/licence-MIT-green.svg)](LICENSE)
[![Statut](https://img.shields.io/badge/statut-stable-brightgreen.svg)](https://github.com/votre-username/jira-boosted)

Une extension de navigateur pour améliorer votre expérience JIRA.

## Navigateurs Supportés

L'extension est compatible avec les versions suivantes des navigateurs :

| Navigateur | Version Minimale | Statut |
|------------|------------------|---------|
| Google Chrome | 88+ | ✅ Supporté |
| Mozilla Firefox | 85+ | ✅ Supporté |
| Microsoft Edge | 88+ | ✅ Supporté |

### Notes de compatibilité
- Chrome 88+ (basé sur Chromium)
- Firefox 85+ (Quantum)
- Edge 88+ (basé sur Chromium)

L'extension utilise les API modernes des navigateurs et nécessite donc des versions récentes pour fonctionner correctement.

## Prérequis

- Un navigateur compatible (voir section "Navigateurs Supportés" ci-dessus)
- Un compte JIRA actif
- Les permissions nécessaires dans votre instance JIRA

## Fonctionnalités

- Ajout de boutons personnalisés dans l'interface JIRA
- Glisser-déposer pour réorganiser les boutons
- Gestion intuitive des boutons (ajout, suppression, réorganisation)
- Interface utilisateur moderne et réactive
- Compatible avec Chrome, Firefox et Edge
- Synchronisation des boutons entre les navigateurs

## Installation

### Chrome
1. Ouvrez Chrome et accédez à `chrome://extensions/`
2. Activez le "Mode développeur" en haut à droite
3. Cliquez sur "Charger l'extension non empaquetée"
4. Sélectionnez le dossier de l'extension

### Firefox
1. Ouvrez Firefox et accédez à `about:debugging#/runtime/this-firefox`
2. Cliquez sur "Charger un module temporaire"
3. Sélectionnez le fichier `manifest.json` dans le dossier de l'extension

### Edge
1. Ouvrez Edge et accédez à `edge://extensions/`
2. Activez le "Mode développeur" en bas à gauche
3. Cliquez sur "Charger une extension non empaquetée"
4. Sélectionnez le dossier de l'extension

## Utilisation

1. Cliquez sur l'icône de l'extension dans votre navigateur
2. Pour ajouter un nouveau bouton :
   - Entrez le nom du bouton
   - Entrez l'URL du lien
   - Cliquez sur "Ajouter le bouton"
3. Pour réorganiser les boutons :
   - Glissez-déposez les boutons dans l'ordre souhaité
4. Pour supprimer un bouton :
   - Cliquez sur le bouton "Supprimer" correspondant

## Structure du projet

```
jira-boosted/
├── manifest.json      # Configuration de l'extension
├── popup.html        # Interface utilisateur de l'extension
├── popup.js         # Logique de l'interface utilisateur
├── content.js       # Script d'injection des boutons dans JIRA
├── content.css      # Styles des boutons injectés
├── icons/
│   ├── icon16.png   # Icône 16x16
│   ├── icon48.png   # Icône 48x48
│   └── icon128.png  # Icône 128x128
└── README.md        # Documentation
```

## Développement

Pour contribuer au projet :

1. Clonez le dépôt
2. Installez les dépendances (si nécessaire)
3. Modifiez les fichiers selon vos besoins
4. Testez l'extension dans votre navigateur
5. Assurez-vous que les tests passent avant de soumettre une PR

## Dépannage

- Si les boutons ne s'affichent pas dans JIRA, rafraîchissez la page
- En cas de problème de synchronisation, déconnectez-vous et reconnectez-vous à votre navigateur
- Pour réinitialiser l'extension, supprimez-la et réinstallez-la

## Licence

MIT 

## Sécurité

- L'extension ne collecte aucune donnée personnelle
- Les boutons personnalisés sont stockés localement dans votre navigateur
- Aucune donnée n'est envoyée à des serveurs externes
- Le code source est ouvert et peut être audité

## Contribution

Nous accueillons les contributions ! Voici comment vous pouvez aider :

1. Signalez les bugs en créant une issue
2. Proposez de nouvelles fonctionnalités
3. Soumettez des pull requests pour corriger des bugs ou ajouter des fonctionnalités

### Processus de contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Ajout d'une fonctionnalité incroyable'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de code

- Suivez les conventions de style existantes
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Assurez-vous que tous les tests passent 