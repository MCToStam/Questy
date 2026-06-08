const Alerte = require("../../util/database/models/Alerte");
const { MessageFlags } = require("discord.js");

async function envoyerAlerteMessage(client, alerte, components) {
  const guild = client.guilds.cache.get(alerte.guild);
  if (!guild) {
    await Alerte.deleteOne({ _id: alerte._id });
    return false;
  }

  const channel = guild.channels.cache.get(alerte.salon);
  if (!channel) {
    await Alerte.deleteOne({ _id: alerte._id });
    return false;
  }

  try {
    await channel.send({
      components,
      flags: MessageFlags.IsComponentsV2,
    });

    return true;
  } catch (err) {
    return false;
  }
}

module.exports = envoyerAlerteMessage;
