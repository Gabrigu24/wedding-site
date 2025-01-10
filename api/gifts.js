const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  const filePath = path.join(__dirname, '../public/gifts.json');

  if (req.method === 'GET') {
    try {
      // Leggi i regali dal file JSON
      const data = fs.readFileSync(filePath, 'utf-8');
      const gifts = JSON.parse(data);
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

      const data = fs.readFileSync(filePath, 'utf-8');
      const gifts = JSON.parse(data);

      const gift = gifts.find((g) => g.id === giftId);

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

      // Salva nel file JSON
      fs.writeFileSync(filePath, JSON.stringify(gifts, null, 2));

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
