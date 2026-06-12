class config {
  constructor() {
    this.support_serveur_id = "";
    this.developpeur = ["719072181631320145"];
    this.colors = {
      error: 0xff0000,
      danger: 0xffa500,
      success: 0x3fff00,
      normal: 0x3029c2,
    };
    this.log_channels = {
      error: "",
      retourBotKick: "",
      avis: "",
      command: "",
      button: "",
      selectMenu: "",
      modal: "",
      invitationBot: "",
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
