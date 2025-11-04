const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

module.exports = async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_access";
  process.env.REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "test_refresh";
  process.env.JWT_ISS = process.env.JWT_ISS || "blog-api";
  process.env.JWT_AUD = process.env.JWT_AUD || "blog-client";
  process.env.FRONTEND_URL =
    process.env.FRONTEND_URL || "http://localhost:4200";

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  global.__MONGOD__ = mongod;
  await mongoose.connect(uri);
};

