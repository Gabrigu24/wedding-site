const mongoose = require('mongoose');
const Gift = require('../../models/gift'); // Assicurati di avere il modello Gift

// Funzione per connettersi a MongoDB
const connectToDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connesso a MongoDB');
    }
  } catch (err) {
    console.error('Errore durante la connessione a MongoDB:', err);
    throw new Error('Errore di connessione al database');
  }
};

module.exports = async (req, res) => {
  console.log('Richiesta ricevuta:', req.method, req.url);

  if (req.method === 'POST') {
    const giftId = parseInt(req.query.id, 10); // Recupera l'ID dalla query string
    const { userName, userEmail, userMessage } = req.body;

    console.log('ID del regalo:', giftId);
    console.log('Dati ricevuti:', req.body);

    // Validazione dell'input
    if (!userName || !userEmail) {
      console.warn('Dati mancanti nella richiesta:', req.body);
      return res.status(400).json({ message: 'Nome ed email sono obbligatori.' });
    }

    try {
      // Connessione al database
      await connectToDatabase();

      // Trova il regalo per ID
      const gift = await Gift.findOne({ id: giftId });

      if (!gift) {
        console.warn('Regalo non trovato per ID:', giftId);
        return res.status(404).json({ message: 'Regalo non trovato.' });
      }

      if (!gift.available) {
        console.warn('Regalo già selezionato:', gift);
        return res.status(400).json({ message: 'Regalo già selezionato.' });
      }

      // Aggiorna lo stato del regalo
      gift.available = false;
      gift.reservedBy = { name: userName, email: userEmail, message: userMessage || '' };

      await gift.save();
      console.log('Regalo aggiornato con successo:', gift);

      res.status(200).json({ message: 'Regalo prenotato con successo!', gift });
    } catch (err) {
      console.error('Errore durante la prenotazione del regalo:', err);
      res.status(500).json({
        message: 'Errore durante la prenotazione del regalo.',
        error: err.message,
      });
    }
  } else {
    console.warn('Metodo non consentito:', req.method);
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Metodo ${req.method} non consentito.` });
  }
};
