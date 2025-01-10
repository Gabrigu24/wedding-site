const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  const filePath = path.join(__dirname, '../public/gifts.json');
  console.log('Percorso del file JSON:', filePath);
  console.log('Metodo della richiesta:', req.method);
  console.log('Headers della richiesta:', req.headers);

  if (req.method === 'GET') {
    try {
      // Verifica l'esistenza del file JSON
      if (!fs.existsSync(filePath)) {
        console.error('File JSON non trovato:', filePath);
        return res.status(404).json({ message: 'File gifts.json non trovato.' });
      }

      // Leggi i regali dal file JSON
      const data = fs.readFileSync(filePath, 'utf-8');
      console.log('Contenuto del file JSON:', data);

      const gifts = JSON.parse(data);
      console.log('Lista dei regali caricata con successo:', gifts);

      res.status(200).json(gifts);
    } catch (error) {
      console.error('Errore durante il caricamento dei regali:', error);
      res.status(500).json({ message: 'Errore durante il caricamento dei regali.' });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('Body della richiesta:', req.body);

      const giftId = parseInt(req.query.id, 10);
      const { userName, userEmail, userMessage } = req.body;

      if (!userName || !userEmail) {
        console.error('Dati mancanti: Nome o email non forniti.');
        return res.status(400).json({ message: 'Nome ed email sono obbligatori.' });
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      const gifts = JSON.parse(data);
      console.log('Lista dei regali prima della modifica:', gifts);

      const gift = gifts.find((g) => g.id === giftId);

      if (!gift) {
        console.error('Regalo non trovato per l\'ID:', giftId);
        return res.status(404).json({ message: 'Regalo non trovato.' });
      }

      if (!gift.available) {
        console.error('Regalo già selezionato:', gift);
        return res.status(400).json({ message: 'Regalo già selezionato.' });
      }

      // Aggiorna il regalo
      gift.available = false;
      gift.reservedBy = {
        name: userName,
        email: userEmail,
        message: userMessage || '',
      };
      console.log('Regalo aggiornato:', gift);

      // Salva nel file JSON
      fs.writeFileSync(filePath, JSON.stringify(gifts, null, 2));
      console.log('Lista dei regali aggiornata e salvata.');

      res.status(200).json({ message: 'Regalo prenotato con successo!', gift });
    } catch (error) {
      console.error('Errore durante la prenotazione del regalo:', error);
      res.status(500).json({ message: 'Errore durante la prenotazione del regalo.' });
    }
  } else {
    console.warn('Metodo non consentito:', req.method);
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Metodo ${req.method} non consentito.` });
  }
};
