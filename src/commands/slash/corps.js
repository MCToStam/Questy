const {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  MessageFlags,
  ContainerBuilder,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("corps")
    .setDescription("Affiche le corps d'un joueur")
    .addStringOption((option) =>
      option
        .setName("pseudo")
        .setDescription("Pseudonyme du joueur")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async execute(client, interaction, config) {
    const pseudo = interaction.options.getString("pseudo");

    const searchRes = await fetch(
      `https://www.earthquest.fr/api/site/public/players/search?q=${encodeURIComponent(pseudo)}`,
    );

    const searchData = await searchRes.json();

    const found = searchData.players.find(
      (p) => p.username.toLowerCase() === pseudo.toLowerCase(),
    );

    if (!found) {
      const container = new ContainerBuilder()
        .setAccentColor(config.colors.error)
        .addTextDisplayComponents((t) => t.setContent("## ❌ Joueur Inconnu"))
        .addSeparatorComponents((s) => s)
        .addTextDisplayComponents((t) =>
          t.setContent("Le joueur spécifié n'a pas été trouvé."),
        );

      return interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    const username = found.username;

    const apiUrl = `https://earthquest.craftserv.fr/?user=${pseudo}`;

    const response = await fetch(apiUrl);

    const imageArrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    const container = new ContainerBuilder()
      .setAccentColor(config.colors.normal)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          `## 🧍‍ Corps de ${username.replace(/_/g, "\\_")}`,
        ),
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

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      files: [{ name: `corps_${pseudo}.png`, attachment: imageBuffer }],
    });
  },
};
