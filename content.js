function createCustomButton(button) {
  const buttonElement = document.createElement('a');
  buttonElement.href = button.url;
  buttonElement.className = 'jira-boosted-button';
  buttonElement.textContent = button.name;
  buttonElement.style.backgroundColor = button.color || '#0052CC';
  buttonElement.style.borderLeft = `4px solid ${button.color || '#0052CC'}`;
  buttonElement.target = '_blank'; // Ouvre dans un nouvel onglet
  buttonElement.rel = 'noopener noreferrer';

  buttonElement.addEventListener('click', (e) => {
    // Empêche toute modification du texte ou du lien
    e.stopPropagation();
    // Laisse le comportement par défaut pour ouvrir le lien
  });

  buttonElement.addEventListener('mouseover', () => {
    // Assombrir la couleur au survol
    const color = button.color || '#0052CC';
    const darkerColor = adjustColor(color, -20);
    buttonElement.style.backgroundColor = darkerColor;
  });
  buttonElement.addEventListener('mouseout', () => {
    buttonElement.style.backgroundColor = button.color || '#0052CC';
  });
  return buttonElement;
}

// Fonction utilitaire pour assombrir/éclaircir une couleur
function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

let isInjected = false;
let jiraBoostedInjected = false;

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

async function injectCustomButtons() {
  if (jiraBoostedInjected) {
    console.log('Injection déjà effectuée, on annule.');
    return;
  }
  jiraBoostedInjected = true;

  console.log('Tentative d\'injection Jira Boosted...');

  // Supprime TOUS les anciens boutons Jira Boosted dans la page (anti-duplication)
  document.querySelectorAll('.jira-boosted-header-container').forEach(container => container.remove());

  // Sélecteur du conteneur de la barre de recherche (juste à droite du logo Jira)
  const selectors = [
    'div._zulp1b66._yyhykb7n._4t3i1osq._4cvr1h6o._1e0c1txw._glte1ris._15ri1mjv._1gs5usvi',
    'div[data-testid="atlassian-navigation-product-home-container"]',
    'header[data-testid="page-layout.top-nav"]'
  ];

  let logoContainer = null;
  for (const sel of selectors) {
    logoContainer = document.querySelector(sel);
    if (logoContainer) break;
  }

  if (!logoContainer) {
    console.log('Aucun conteneur compatible trouvé, injection annulée pour cette page.');
    jiraBoostedInjected = false;
    return;
  }

  try {
    // Crée le conteneur
    const container = document.createElement('span');
    container.className = 'jira-boosted-header-container';
    container.id = 'jira-boosted-container';
    container.style.marginLeft = '10px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';

    // Récupère les boutons personnalisés
    const result = await new Promise(resolve => chrome.storage.sync.get(['customButtons'], resolve));
    const buttons = result.customButtons || [];
    
    if (buttons.length === 0) return;
    
    // Crée un fragment de document pour optimiser les performances
    const fragment = document.createDocumentFragment();
    
    // Utilise l'ordre exact des boutons tel que stocké
    buttons.forEach(button => {
      fragment.appendChild(createCustomButton(button));
    });
    
    container.appendChild(fragment);
    
    // Insère les boutons AVANT la barre de recherche si possible
    const searchInput = logoContainer.querySelector('input[type="text"]');
    if (searchInput && searchInput.parentElement) {
      searchInput.parentElement.parentElement.insertBefore(container, searchInput.parentElement);
    } else {
      // Sinon, ajoute à la fin du conteneur
      logoContainer.appendChild(container);
    }

    console.log('Boutons Jira Boosted injectés avec succès dans l\'ordre suivant:', 
      buttons.map(b => b.name).join(', '));

    // Observer la disparition du conteneur pour réinitialiser le flag
    const observer = new MutationObserver(() => {
      if (!document.querySelector('.jira-boosted-header-container')) {
        jiraBoostedInjected = false;
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

  } catch (error) {
    console.error('Erreur lors de l\'injection des boutons:', error);
    jiraBoostedInjected = false;
  }
}

function safeInject() {
  // Vérifie d'abord si les boutons existent déjà
  if (document.getElementById('jira-boosted-container')) {
    console.log('Les boutons existent déjà, pas besoin de réinjecter');
    return;
  }
  
  injectCustomButtons().catch(error => {
    console.error('Erreur lors de l\'injection des boutons:', error);
  });
}

function isValidJiraPage() {
  return window.location.hostname.includes('atlassian.net');
}

function initialize() {
  if (!isValidJiraPage()) return;

  // Réinitialise l'état d'injection lors du chargement de la page
  isInjected = false;
  
  // Injection initiale avec un délai pour laisser le temps à la page de charger
  setTimeout(safeInject, 1000);

  // Observer pour les changements de navigation (SPA)
  let observer = new MutationObserver((mutations, obs) => {
    if (!isInjected) {
      safeInject();
    }
  });

  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  // Réinitialise l'état d'injection lors des changements de boutons
  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.customButtons) {
        isInjected = false;
        safeInject();
      }
    });
  }

  // Gestion des événements de navigation
  window.addEventListener('popstate', () => {
    isInjected = false;
    setTimeout(safeInject, 1000);
  });

  // Gestion du rechargement de la page
  window.addEventListener('load', () => {
    isInjected = false;
    setTimeout(safeInject, 1000);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}