class config {
  constructor() {
    this.support_serveur_id = "743741992194015314";
    this.developpeur = ["719072181631320145"];
    this.colors = {
      error: 0xff0000,
      danger: 0xffa500,
      success: 0x3fff00,
      normal: 0x3029c2,
    };
    this.log_channels = {
      error: "743742205671505962",
      retourBotKick: "743742205671505962",
      avis: "743742205671505962",
      command: "743742205671505962",
      button: "743742205671505962",
      selectMenu: "743742205671505962",
      modal: "743742205671505962",
      invitationBot: "743742205671505962",
    };
    this.channels = {
      log: "743741992730624092",
      suggestion: "743743667503628300000",
      update: "1238132941478166599",
      changelog: {
        glorybot: "1238132940232462457",
        glorystaff: "1327554503846924311",
        gloryrp: "1428357770867900456",
      },
    };
    this.couleur = {
      mars: 0xfe3636,
    };
    this.liste_serveur = ["mars"];
    this.serveurName = {
      mars: "Mars",
    };
    this.emoji = {
      mars: "1504814414443053136",
    };
    this.emoji_formate = Object.fromEntries(
      Object.entries(this.emoji).map(([serveur, id]) => [
        serveur,
        `<:${serveur.toLowerCase()}:${id}>`,
      ]),
    );
  }
}

module.exports = new config();
