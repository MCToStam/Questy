const {
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: {
    name: "skin_corps",
  },

  async execute(client, interaction, config) {
    const pseudo = interaction.customId.split("-")[1];

    const apiUrl = `https://earthquest.craftserv.fr/?user=${pseudo}`;

    const response = await fetch(apiUrl);

    const imageArrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    const container = new ContainerBuilder()
      .setAccentColor(config.colors.normal)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`## 🧍 Corps de ${pseudo.replace(/_/g, "\\_")}`),
      )
      .addSeparatorComponents((separator) => separator)
      .addMediaGalleryComponents((g) =>
        g.addItems((item) => item.setURL(`attachment://corps_${pseudo}.png`)),
      )
      .addSeparatorComponents((separator) => separator)
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`skin_tete-${pseudo}`)
            .setLabel("👩‍ Afficher la Tête")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`skin_corps-${pseudo}`)
            .setLabel("🧍‍ Afficher le Corps")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        ),
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`skin_skin-${pseudo}`)
            .setLabel("👥 Afficher le Skin")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`skin_modele-${pseudo}`)
            .setLabel("👤 Afficher le Modèle")
            .setStyle(ButtonStyle.Primary),
        ),
      );

    await interaction.update({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      files: [{ name: `corps_${pseudo}.png`, attachment: imageBuffer }],
    });
  },
};
