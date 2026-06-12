const {
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const log = require("../../../util/module/log");
const config = require("../../../config");

module.exports = async (client, interaction) => {
  const roleSelect = client.container.roleSelects.get(
    interaction.customId.split("-")[0],
  );

  if (!roleSelect) return;

  const originalMessage = interaction?.message?.reference
    ? await interaction.channel.messages.fetch(
        interaction.message.reference.messageId,
      )
    : interaction.message;

  const authorId = originalMessage.interaction?.user?.id;

  if (
    interaction.message?.interaction &&
    authorId &&
    interaction.user.id !== authorId
  ) {
    const permissionContainer = new ContainerBuilder()
      .setAccentColor(config.colors.error)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent("## 🚫 Intéraction Interdite"),
      )
      .addSeparatorComponents((separator) => separator)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          "Vous n'avez pas la permission d'intéragir avec ce bouton car vous n'êtes pas l'auteur de la commande.",
        ),
      );

    return interaction.reply({
      components: [permissionContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  try {
    await roleSelect.execute(client, interaction, config);
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
          `**🔧 Action Effectuée :** ${interaction.customId}`,
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

  const channel = await client.channels.fetch(config.log_channels.selectMenu);

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
        } (<@${interaction.user.id}>)\n**🔧 Valeur :** ${interaction.customId.replace(/_/g, "\\_")}`,
      ),
    );

  await channel.send({
    components: [logContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  });
};
