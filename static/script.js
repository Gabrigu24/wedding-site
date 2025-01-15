const apiUrl = 'https://wedding-site-wheat.vercel.app/api/gifts';

let selectedGiftId = null;

async function loadGifts() {
  const loadingMessage = document.getElementById('loadingMessage');
  const errorMessage = document.getElementById('errorMessage');
  const giftsContainer = document.getElementById('gifts');

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Errore nel caricamento dei regali');

    const gifts = await response.json();
    loadingMessage.style.display = 'none';

    if (gifts.length === 0) {
      giftsContainer.innerHTML = '<p class="text-center">Nessun regalo disponibile al momento.</p>';
      giftsContainer.style.display = 'block';
      return;
    }

    giftsContainer.innerHTML = '';
    giftsContainer.style.display = 'flex';

    gifts.forEach((gift) => {
      const giftDiv = document.createElement('div');
      giftDiv.className = 'col-md-4';
      giftDiv.innerHTML = `
        <div class="gift-card">
          <img src="${gift.image}" alt="${escapeHtml(gift.name)}" class="gift-image">
          <h4>${escapeHtml(gift.name)}</h4>
          <p>${escapeHtml(gift.description)}</p>
          <button class="btn btn-primary" ${!gift.available ? 'disabled' : ''} onclick="showConfirmationModal(${gift.id}, '${escapeHtml(gift.name)}', '${escapeHtml(gift.description)}')">
            ${gift.available ? 'Prenota' : 'Non Disponibile'}
          </button>
          <a href="${gift.link}" target="_blank" class="gift-link">Vedi il regalo</a>
        </div>
      `;
      giftsContainer.appendChild(giftDiv);
    });
  } catch (error) {
    console.error(error);
    loadingMessage.style.display = 'none';
    errorMessage.innerText = 'Errore durante il caricamento dei regali.';
    errorMessage.style.display = 'block';
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function showConfirmationModal(id, name, description) {
  selectedGiftId = id;
  document.getElementById('modalGiftName').innerText = `Stai scegliendo "${name}" come regalo. Vuoi confermare?`;
  document.getElementById('modalGiftDescription').innerText = description;
  document.getElementById('confirmationModal').style.display = 'block';
  document.getElementById('modalOverlay').style.display = 'block';
}

function hideConfirmationModal() {
  document.getElementById('confirmationModal').style.display = 'none';
  document.getElementById('modalOverlay').style.display = 'none';
}

async function confirmSelection() {
  const userName = document.getElementById('userName').value.trim();
  const userEmail = document.getElementById('userEmail').value.trim();
  const userMessage = document.getElementById('userMessage').value.trim();

  if (!userName || !userEmail) {
    alert('Per favore, inserisci il tuo nome e la tua email.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${selectedGiftId}/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, userEmail, userMessage }),
    });

    hideConfirmationModal();

    if (response.ok) {
      alert('Regalo prenotato con successo!');
      loadGifts();
    } else {
      const error = await response.json();
      alert(`Errore: ${error.message}`);
    }
  } catch (error) {
    alert('Errore durante la connessione al server.');
    console.error(error);
  }
}

document.getElementById('confirmButton').addEventListener('click', confirmSelection);
document.getElementById('cancelButton').addEventListener('click', hideConfirmationModal);

loadGifts();
