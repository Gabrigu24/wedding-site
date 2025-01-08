const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express(); // Inizializzazione dell'app Express
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Per il parsing dei body delle richieste JSON

// Verifica se gifts.json esiste e inizializza se necessario
const path = './gifts.json';
if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify([], null, 2));
}

// Carica i dati iniziali da gifts.json
let gifts = JSON.parse(fs.readFileSync(path, 'utf-8'));

// Funzione per salvare i dati nel file JSON
function saveGiftsToFile() {
    fs.writeFileSync(path, JSON.stringify(gifts, null, 2));
}

// Endpoint per ottenere la lista di regali
app.get('/api/gifts', (req, res) => {
    res.json(gifts);
});

// Endpoint per selezionare un regalo
app.post('/api/gifts/:id/select', (req, res) => {
    const giftId = parseInt(req.params.id, 10); // Converte l'ID da stringa a numero
    const gift = gifts.find((g) => g.id === giftId);

    if (!gift) {
        return res.status(404).json({ message: 'Regalo non trovato' });
    }
    if (!gift.available) {
        return res.status(400).json({ message: 'Regalo già selezionato' });
    }

    const { userName, userEmail, userMessage } = req.body;

    if (!userName || !userEmail) {
        return res.status(400).json({ message: 'Nome ed email sono obbligatori' });
    }

    // Aggiorna il regalo con i dati dell'utente
    gift.available = false;
    gift.reservedBy = {
        name: userName,
        email: userEmail,
        message: userMessage || '',
    };

    // Salva i dati nel file JSON
    saveGiftsToFile();

    res.json({ message: 'Regalo prenotato con successo', gift });
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
