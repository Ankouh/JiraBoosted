document.addEventListener('DOMContentLoaded', function() {
  const buttonList = document.getElementById('buttonList');
  const buttonNameInput = document.getElementById('buttonName');
  const buttonUrlInput = document.getElementById('buttonUrl');
  const buttonColorInput = document.getElementById('buttonColor');
  const addButton = document.getElementById('addButton');
  const buttonCount = document.getElementById('buttonCount');
  const statusDiv = document.getElementById('status');
  const refreshNotice = document.getElementById('refreshNotice');

  console.log('Popup chargée, chargement des boutons...');

  // Fonction pour afficher le message de rafraîchissement
  function showRefreshNotice() {
    console.log('Affichage du message de rafraîchissement');
    refreshNotice.classList.add('visible');
    // Garder le message visible
    clearTimeout(refreshNotice.timeout);
    // Le cacher après 10 secondes
    refreshNotice.timeout = setTimeout(() => {
      refreshNotice.classList.remove('visible');
    }, 10000);
  }

  // Mettre à jour le compteur de boutons
  function updateButtonCount(count) {
    buttonCount.textContent = `${count} bouton${count > 1 ? 's' : ''}`;
  }

  // Gestion du drag and drop
  function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    saveButtonOrder();
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const draggingElement = document.querySelector('.dragging');
    const currentElement = e.target.closest('.button-item');
    
    if (!draggingElement || !currentElement || draggingElement === currentElement) {
      return;
    }

    const rect = currentElement.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isAfter = e.clientY > midY;
    
    if (isAfter) {
      currentElement.parentNode.insertBefore(draggingElement, currentElement.nextSibling);
    } else {
      currentElement.parentNode.insertBefore(draggingElement, currentElement);
    }
  }

  function saveButtonOrder() {
    const buttons = Array.from(document.querySelectorAll('.button-item')).map(button => {
      const nameSpan = button.querySelector('span:first-of-type');
      const urlSpan = button.querySelector('span:nth-child(2)');
      const color = button.dataset.color;
      
      if (!nameSpan || !urlSpan) {
        console.error('Éléments span manquants dans le bouton');
        return null;
      }

      return {
        name: nameSpan.textContent,
        url: urlSpan.textContent,
        color: color || '#0052CC'
      };
    }).filter(button => button !== null);

    chrome.storage.sync.set({ customButtons: buttons }, function() {
      showStatus('Ordre des boutons mis à jour !');
      showRefreshNotice();
      console.log('Nouvel ordre des boutons sauvegardé:', buttons.map(b => b.name).join(', '));
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    saveButtonOrder();
  }

  // Charger les boutons personnalisés
  function loadCustomButtons() {
    chrome.storage.sync.get(['customButtons'], function(result) {
      console.log('Boutons récupérés dans la popup :', result.customButtons);
      const buttons = result.customButtons || [];
      buttonList.innerHTML = '';
      updateButtonCount(buttons.length);
      
      if (buttons.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.style.textAlign = 'center';
        emptyState.style.padding = '20px';
        emptyState.style.color = '#6B778C';
        emptyState.textContent = 'Aucun bouton personnalisé';
        buttonList.appendChild(emptyState);
        return;
      }
      
      buttons.forEach((button, index) => {
        const buttonElement = document.createElement('div');
        buttonElement.className = 'button-item';
        buttonElement.draggable = true;
        buttonElement.dataset.index = index;
        buttonElement.dataset.color = button.color || '#0052CC';
        buttonElement.style.borderLeft = `4px solid ${button.color || '#0052CC'}`;
        buttonElement.innerHTML = `
          <div class="drag-handle">⋮⋮</div>
          <span title="${button.name}">${button.name}</span>
          <span title="${button.url}">${button.url}</span>
          <button class="delete" data-index="${index}" title="Supprimer ce bouton">Supprimer</button>
        `;

        // Ajout des événements de drag and drop
        buttonElement.addEventListener('dragstart', handleDragStart);
        buttonElement.addEventListener('dragend', handleDragEnd);
        
        buttonList.appendChild(buttonElement);
      });

      // Ajout des événements de drag and drop sur le conteneur
      buttonList.addEventListener('dragover', handleDragOver);
      buttonList.addEventListener('drop', handleDrop);

      // Ajouter les écouteurs d'événements pour les boutons de suppression
      document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', function() {
          const index = parseInt(this.dataset.index);
          if (confirm('Êtes-vous sûr de vouloir supprimer ce bouton ?')) {
            deleteCustomButton(index);
          }
        });
      });
    });
  }

  // Supprimer un bouton personnalisé
  function deleteCustomButton(index) {
    chrome.storage.sync.get(['customButtons'], function(result) {
      const buttons = result.customButtons || [];
      const deletedButton = buttons[index];
      buttons.splice(index, 1);
      chrome.storage.sync.set({ customButtons: buttons }, function() {
        loadCustomButtons();
        showStatus(`Le bouton "${deletedButton.name}" a été supprimé`);
        showRefreshNotice();
      });
    });
  }

  // Ajouter un nouveau bouton personnalisé
  addButton.addEventListener('click', function() {
    const name = buttonNameInput.value.trim();
    const url = buttonUrlInput.value.trim();
    const color = buttonColorInput.value;

    if (!name || !url) {
      showStatus('Veuillez remplir tous les champs', 'error');
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      showStatus('URL invalide', 'error');
      return;
    }

    chrome.storage.sync.get(['customButtons'], function(result) {
      const buttons = result.customButtons || [];
      
      if (buttons.some(b => b.name === name)) {
        showStatus('Un bouton avec ce nom existe déjà', 'error');
        return;
      }
      
      buttons.push({ name, url, color });
      chrome.storage.sync.set({ customButtons: buttons }, function() {
        buttonNameInput.value = '';
        buttonUrlInput.value = '';
        buttonColorInput.value = '#0052CC';
        loadCustomButtons();
        showStatus('Bouton ajouté avec succès !', 'success');
        showRefreshNotice();
      });
    });
  });

  // Afficher un message de statut
  function showStatus(message, type = 'success') {
    statusDiv.textContent = message;
    statusDiv.style.backgroundColor = type === 'error' ? '#FFEBE6' : '#E3FCEF';
    statusDiv.style.color = type === 'error' ? '#DE350B' : '#006644';
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.style.backgroundColor = '';
      statusDiv.style.color = '';
    }, 3000);
  }

  // Charger les boutons au démarrage
  loadCustomButtons();
}); 