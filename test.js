require('dotenv').config();
const mongoose = require('mongoose');


// const uri =  "mongodb+srv://gblgn24:BTyc30LNIm3w77Yb@cluster0.lvi32.mongodb.net/wedding_gifts?retryWrites=true&w=majority";
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connesso a MongoDB');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Errore di connessione a MongoDB:', err);
    process.exit(1);
  });
