const config = require("../config");

const serveurs = config.liste_serveur.map((s) => ({
  name: config.serveurName[s],
  value: s,
}));

module.exports = serveurs;
