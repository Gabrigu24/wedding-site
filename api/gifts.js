// require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Schema e modello Mongoose
const giftSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  available: { type: Boolean, default: true },
  reservedBy: {
    name: String,
    email: String,
    message: String,
  },
});
const Gift = mongoose.model('Gift', giftSchema);

// Funzione per connettersi a MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) { // Controlla se non esiste una connessione attiva
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connesso a MongoDB');
    } catch (err) {
      console.error('Errore di connessione a MongoDB:', err);
      throw err;
    }
  }
};

// Endpoint per ottenere i regali
app.get('/api/gifts', async (req, res) => {
  try {
    await connectToDatabase(); // Connettiti al database
    const gifts = await Gift.find();
    res.status(200).json(gifts);
  } catch (err) {
    console.error('Errore nel recupero dei regali:', err);
    res.status(500).json({ message: 'Errore durante il recupero dei regali.', error: err.message });
  }
});

// Endpoint per selezionare un regalo
app.post('/api/gifts/:id/select', async (req, res) => {
  const giftId = parseInt(req.params.id, 10); // Converte l'ID in numero
  const { userName, userEmail, userMessage } = req.body;

  if (!userName || !userEmail) {
    return res.status(400).json({ message: 'Nome ed email sono obbligatori.' });
  }

  try {
    await connectToDatabase(); // Connettiti al database

    const gift = await Gift.findOne({ id: giftId });

    if (!gift) {
      return res.status(404).json({ message: 'Regalo non trovato.' });
    }

    if (!gift.available) {
      return res.status(400).json({ message: 'Regalo già selezionato.' });
    }

    gift.available = false;
    gift.reservedBy = { name: userName, email: userEmail, message: userMessage || '' };

    await gift.save();

    res.status(200).json({ message: 'Regalo prenotato con successo!', gift });
  } catch (err) {
    console.error('Errore durante la prenotazione del regalo:', err);
    res.status(500).json({ message: 'Errore durante la prenotazione del regalo.', error: err.message });
  }
});

// Avvia il server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
  });
}

module.exports = app; // Esporta l'app per l'ambiente serverless (Vercel)
