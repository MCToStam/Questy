const mongoose = require("mongoose");

const { getQuestyConnection } = require("../index");

const QuestyConnection = getQuestyConnection();

const alerteSchema = new mongoose.Schema({
  serveur: { type: String, required: true },
  cible: { type: String, required: true },
  salon: { type: String, required: true },
  type: { type: String, enum: ["connexion"], required: true },
  guild: { type: String, required: true },
  role: { type: [String], default: [] },
  expiration: { type: Date, default: null },
  avertissement: {
    type: Object,
    default: { 1: false, 2: false, 3: false },
  },
  data: { type: Boolean, default: false },
});

module.exports = QuestyConnection.model("Alerte", alerteSchema);
