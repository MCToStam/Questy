const mongoose = require("mongoose");
const log = require("../../util/module/log");

let QuestyConnection;

async function connectMongo() {
  try {
    QuestyConnection = mongoose.createConnection(process.env.MONGO_URI_QUESTY);

    log("MongoDB est correctement connecté", "READY", "green");
  } catch (err) {
    console.error(`❌ Erreur MongoDB : ${err}`);
  }
}

module.exports = {
  connectMongo,
  getQuestyConnection: () => QuestyConnection,
};
