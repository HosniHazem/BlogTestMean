const mongoose = require("mongoose");

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 12000,
  });
  return mongoose;
}

async function disconnectMongo() {
  await mongoose.connection.close();
}

module.exports = { connectMongo, disconnectMongo };
