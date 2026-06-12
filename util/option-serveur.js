const config = require("../config");

const serveurs = config.liste_serveur.map((s) => ({
  name: config.serveur[s].nom,
  value: s,
}));

module.exports = serveurs;
