require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion MongoDB réussie!');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections disponibles:', collections.map(c => c.name));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testConnection();