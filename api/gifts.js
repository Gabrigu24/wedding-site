const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Stringa di connessione a MongoDB
const uri =  "mongodb+srv://gblgn24:BTyc30LNIm3w77Yb@cluster0.lvi32.mongodb.net/wedding_gifts?retryWrites=true&w=majority";

// Connettiti a MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => console.error('Errore di connessione a MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Definizione dello schema e modello Mongoose
const giftSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  image: String,
  link: String,
  available: { type: Boolean, default: true },
  reservedBy: {
    name: String,
    email: String,
    message: String,
  },
});

const Gift = mongoose.model('Gift', giftSchema);

// **Endpoint per ottenere tutti i regali**
app.get('/api/gifts.js', async (req, res) => {
  try {
    const gifts = await Gift.find(); // Recupera tutti i documenti dalla collezione
    res.status(200).json(gifts);
  } catch (err) {
    console.error('Errore durante il recupero dei regali:', err);
    res.status(500).json({ message: 'Errore durante il recupero dei regali.' });
  }
});

// **Endpoint per aggiornare lo stato di un regalo**
app.post('/api/gifts.js/:id/select', async (req, res) => {
  const giftId = req.params.id;
  const { userName, userEmail, userMessage } = req.body;

  if (!userName || !userEmail) {
    return res.status(400).json({ message: 'Nome ed email sono obbligatori.' });
  }

  try {
    const gift = await Gift.findOne({ id: giftId });

    if (!gift) {
      return res.status(404).json({ message: 'Regalo non trovato.' });
    }

    if (!gift.available) {
      return res.status(400).json({ message: 'Regalo già selezionato.' });
    }

    // Aggiorna il regalo
    gift.available = false;
    gift.reservedBy = {
      name: userName,
      email: userEmail,
      message: userMessage || '',
    };

    await gift.save(); // Salva le modifiche nel database

    res.status(200).json({ message: 'Regalo prenotato con successo!', gift });
  } catch (err) {
    console.error('Errore durante l\'aggiornamento del regalo:', err);
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del regalo.' });
  }
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
