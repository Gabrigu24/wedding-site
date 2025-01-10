const mongoose = require('mongoose');
const fs = require('fs');

// Stringa di connessione a MongoDB
const uri = "mongodb+srv://gblgn24:BTyc30LNIm3w77Yb@cluster0.lvi32.mongodb.net/wedding_gifts?retryWrites=true&w=majority";

// Connettiti a MongoDB
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

// Leggi il file JSON
const filePath = './gifts.json'; // Percorso al file JSON
const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Funzione per importare i dati
async function importData() {
  try {
    // Cancella tutti i dati esistenti nella collezione
    await Gift.deleteMany({});
    console.log('Collezione svuotata.');

    // Inserisci i nuovi dati
    await Gift.insertMany(jsonData);
    console.log('Dati importati con successo!');

    mongoose.connection.close(); // Chiudi la connessione
    console.log('Connessione a MongoDB chiusa.');
  } catch (error) {
    console.error('Errore durante l\'importazione dei dati:', error);
  }
}

// Avvia l'importazione
importData();