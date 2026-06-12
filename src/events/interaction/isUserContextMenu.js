const {
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  Collection,
} = require("discord.js");
const log = require("../../../util/module/log");
const config = require("../../../config");

module.exports = async (client, interaction) => {
  const userCmd = client.container.userCmds.get(interaction.commandName);
  if (!userCmd) return;

  if (userCmd.desactive) {
    const disabledContainer = new ContainerBuilder()
      .setAccentColor(config.colors.error)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("## 🚫 Commande Désactivée"),
      )
      .addSeparatorComponents((separator) => separator)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          "Cette commande est désactivé et donc innaccessible.",
        ),
      );

    return interaction.reply({
      components: [disabledContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  const { cooldowns } = client;

  if (!cooldowns.has(userCmd.data.name)) {
    cooldowns.set(userCmd.data.name, new Collection());
  }

  if (!config.developpeur.includes(interaction.user.id)) {
    const now = Date.now();
    const timestamps = cooldowns.get(userCmd.data.name);
    const cooldownAmount = (userCmd.cooldown ?? 5) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        const cooldownContainer = new ContainerBuilder()
          .setAccentColor(config.colors.error)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent("## ⏱️ Cooldown"),
          )
          .addSeparatorComponents((separator) => separator)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              `Cette commande est actuellement sous cooldown, tu pourras la réutiliser <t:${expiredTimestamp}:R>.`,
            ),
          );

        return interaction.reply({
          components: [cooldownContainer],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  }

  try {
    await userCmd.execute(client, interaction);
  } catch (e) {
    const errorContainer = new ContainerBuilder()
      .setAccentColor(config.colors.error)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("## ❌ Erreur"),
      )
      .addSeparatorComponents((separator) => separator)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          "Une erreur est survenue lors de l'exécution de cette intéraction. Si le problème se reproduit, il est important de le signaler sur le serveur support.",
        ),
      );

    if (
      config.support_serveur_invite &&
      (config.support_serveur_invite.startsWith("https://") ||
        config.support_serveur_invite.startsWith("http://"))
    ) {
      errorContainer
        .addSeparatorComponents((separator) => separator)
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setURL("config.support_serveur_invite")
              .setEmoji("1307452239052279858")
              .setLabel("Serveur Support")
              .setStyle(ButtonStyle.Link),
          ),
        );
    }

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    log(e, "error", "red");

    const channel = await client.channels.fetch(config.log_channels.error);

    const errorLogContainer = new ContainerBuilder()
      .setAccentColor(config.colors.error)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("## ❌ Erreur"),
      )
      .addSeparatorComponents((separator) => separator)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          `**🔧 Action Effectuée :** ${interaction.commandName}`,
        ),
      )
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`**💢 Erreur :** \`\`\`${e}\`\`\``),
      );

    await channel.send({
      components: [errorLogContainer],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  const channel = await client.channels.fetch(config.log_channels.command);

  const logContainer = new ContainerBuilder()
    .setAccentColor(config.colors.success)
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent("## 📗 Log"),
    )
    .addSeparatorComponents((separator) => separator)
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(
        `**👷 Utilisateur :** ${
          interaction.user.globalName?.replace(/_/g, "\\_") ||
          interaction.user.username?.replace(/_/g, "\\_")
        } (<@${interaction.user.id}>)\n**🔧 Valeur :** ${interaction.commandName}`,
      ),
    );

  await channel.send({
    components: [logContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};
