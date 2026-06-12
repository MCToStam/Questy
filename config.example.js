class config {
  constructor() {
    this.support_serveur_id = "";
    this.support_serveur_invite = "";
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
    this.serveur = {
      mars: {
        nom: "Mars",
        type: "java",
        emoji: "1504814414443053136",
        emoji_formate: "<:mars:1504814414443053136>",
        couleur: 0xfe3636,
        dynmap: "https://mars.earthquest.fr",
      },
    };
    this.liste_serveur = Object.keys(this.serveur);
    this.liste_serveur_java = Object.entries(this.serveur)
      .filter(([, data]) => data.type === "java")
      .map(([name]) => name);
    this.liste_serveur_bedrock = Object.entries(this.serveur)
      .filter(([, data]) => data.type === "bedrock")
      .map(([name]) => name);
  }
}

module.exports = new config();
