const config = require("../../config");
const Alerte = require("../../util/database/models/Alerte");
const { getEmojiTete } = require("../../util/module/emoji");
const envoyerAlerteMessage = require("../../util/alerte/envoyerAlerteMessage");
const { TextDisplayBuilder, ContainerBuilder } = require("discord.js");

async function checkAlerteConnexion(client, serveur) {
  const url = `${config.serveur[serveur].dynmap}/up/world/earth/${Date.now()}`;

  const res = await fetch(url);
  if (!res.ok) return;

  const data = await res.json();
  const players = data.players || [];

  const alertes = await Alerte.find({ serveur });

  for (const alerte of alertes) {
    const isOnline = players.some((p) => p.account === alerte.cible);

    if (isOnline === alerte.data) continue;

    const verb = isOnline ? "connecté" : "déconnecté";

    const emojiTete = await getEmojiTete(client, alerte.cible);

    const container = new ContainerBuilder()
      .setAccentColor(isOnline ? config.colors.success : config.colors.danger)
      .addTextDisplayComponents((t) => t.setContent("## 🚨 Alerte Connexion"))
      .addSeparatorComponents((s) => s)
      .addTextDisplayComponents((t) =>
        t.setContent(
          `${emojiTete} **${alerte.cible}** vient de se ${verb} sur le serveur ` +
            `${config.serveur[serveur].emoji_formate} **${config.serveur[serveur].nom}**.`,
        ),
      );

    const components = [];
    if (alerte.role?.length > 0 && isOnline) {
      components.push(
        new TextDisplayBuilder().setContent(
          alerte.role.map((r) => `<@&${r}>`).join(" "),
        ),
      );
    }
    components.push(container);

    const sent = await envoyerAlerteMessage(client, alerte, components);

    if (sent) {
      alerte.data = isOnline;
      await alerte.save();
    }
  }
}

module.exports = checkAlerteConnexion;
