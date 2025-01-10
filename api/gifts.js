const mongoose = require('mongoose');
const Gift = require('../../models/gift'); // Assicurati di avere il modello Gift

// Funzione per connettersi a MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connesso a MongoDB');
  }
};

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const giftId = parseInt(req.query.id, 10); // Recupera l'ID dalla query string
    const { userName, userEmail, userMessage } = req.body;

    if (!userName || !userEmail) {
      return res.status(400).json({ message: 'Nome ed email sono obbligatori.' });
    }

    try {
      // Connessione al database
      await connectToDatabase();

      const gift = await Gift.findOne({ id: giftId });

      if (!gift) {
        return res.status(404).json({ message: 'Regalo non trovato.' });
      }

      if (!gift.available) {
        return res.status(400).json({ message: 'Regalo già selezionato.' });
      }

      // Aggiorna il regalo
      gift.available = false;
      gift.reservedBy = { name: userName, email: userEmail, message: userMessage || '' };

      await gift.save();

      res.status(200).json({ message: 'Regalo prenotato con successo!', gift });
    } catch (err) {
      console.error('Errore durante la prenotazione del regalo:', err);
      res.status(500).json({ message: 'Errore durante la prenotazione del regalo.', error: err.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Metodo ${req.method} non consentito.` });
  }
};
