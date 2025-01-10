const mongoose = require('mongoose');

// Connessione a MongoDB
const uri = process.env.MONGODB_URI ||  "mongodb+srv://gblgn24:BTyc30LNIm3w77Yb@cluster0.lvi32.mongodb.net/wedding_gifts?retryWrites=true&w=majority";
;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => console.error('Errore di connessione a MongoDB:', err));

// Definizione dello schema dei regali
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

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const gifts = await Gift.find();
      res.status(200).json(gifts);
    } catch (error) {
      console.error('Errore durante il caricamento dei regali:', error);
      res.status(500).json({ message: 'Errore durante il caricamento dei regali.' });
    }
  } else if (req.method === 'POST') {
    try {
      const giftId = parseInt(req.query.id, 10);
      const { userName, userEmail, userMessage } = req.body;

      if (!userName || !userEmail) {
        return res.status(400).json({ message: 'Nome ed email sono obbligatori.' });
      }

      const gift = await Gift.findOne({ id: giftId });

      if (!gift) {
        return res.status(404).json({ message: 'Regalo non trovato.' });
      }

      if (!gift.available) {
        return res.status(400).json({ message: 'Regalo già selezionato.' });
      }

      // Aggiorna il regalo come prenotato
      gift.available = false;
      gift.reservedBy = {
        name: userName,
        email: userEmail,
        message: userMessage || '',
      };

      await gift.save();
      res.status(200).json({ message: 'Regalo prenotato con successo!', gift });
    } catch (error) {
      console.error('Errore durante la prenotazione del regalo:', error);
      res.status(500).json({ message: 'Errore durante la prenotazione del regalo.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Metodo ${req.method} non consentito.` });
  }
};
