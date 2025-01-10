// require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb) return cachedDb;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedDb = db;
    return db;
  } catch (err) {
    console.error('Errore di connessione a MongoDB:', err);
    throw err;
  }
};

// Endpoint GET
app.get('/api/gifts', async (req, res) => {
  try {
    await connectToDatabase();
    const gifts = await Gift.find();
    res.status(200).json(gifts);
  } catch (err) {
    res.status(500).json({ message: 'Errore durante il recupero dei regali.', error: err.message });
  }
});

// Endpoint POST
app.post('/api/gifts/:id/select', async (req, res) => {
  const { userName, userEmail, userMessage } = req.body;
  const giftId = parseInt(req.params.id, 10);

  if (!userName || !userEmail) {
    return res.status(400).json({ message: 'Nome ed email sono obbligatori.' });
  }

  try {
    await connectToDatabase();
    const gift = await Gift.findOne({ id: giftId });
    if (!gift) return res.status(404).json({ message: 'Regalo non trovato.' });
    if (!gift.available) return res.status(400).json({ message: 'Regalo già selezionato.' });

    gift.available = false;
    gift.reservedBy = { name: userName, email: userEmail, message: userMessage || '' };
    await gift.save();

    res.status(200).json({ message: 'Regalo prenotato con successo!', gift });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante la prenotazione del regalo.', error: err.message });
  }
});

module.exports = serverless(app);
