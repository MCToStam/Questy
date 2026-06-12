const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const serveurs = require("../../../util/option-serveur");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serveur")
    .setDescription("Affiche les informations d'un serveur")
    .addStringOption((option) =>
      option
        .setName("serveur")
        .setDescription("Le serveur")
        .setRequired(true)
        .addChoices(...serveurs),
    ),

  async execute(client, interaction, config) {
    const serveur = interaction.options.getString("serveur");

    const res = await fetch(
      `https://www.earthquest.fr/api/site/public/servers/${serveur}/full`,
    );
    const resCountry = await fetch(
      `https://www.earthquest.fr/api/site/public/servers/${serveur}/countries`,
    );

    const data = await res.json();
    const dataCountry = await resCountry.json();

    const serveurData = data.server;

    const STAFF_COUNTRIES = ["warzone", "safezone"];

    const stats = data.stats?.[0];
    const totalBalance = dataCountry.countries.reduce((sum, p) => {
      return sum + Math.floor(Number(p.money));
    }, 0);
    const countries = dataCountry.countries.filter(
      (p) => !p.id.includes(STAFF_COUNTRIES),
    ).length;

    const container = new ContainerBuilder()
      .setAccentColor(parseInt(serveurData.colorHex.replace("#", ""), 16))
      .addTextDisplayComponents((t) =>
        t.setContent(
          `## ${config.serveur[serveur].emoji_formate} Serveur ${serveurData.displayName}${serveurData.description ? `\n*${serveurData.description}*` : ""}`,
        ),
      )
      .addSeparatorComponents((s) => s)
      .addTextDisplayComponents((t) =>
        t.setContent(
          `**Joueur${serveurData.onlinePlayers.length > 1 ? "s" : ""} Connecté${serveurData.onlinePlayers.length > 1 ? "s" : ""} :** ${serveurData.onlinePlayers}/${serveurData.maxPlayers || 150}\n` +
            `**Argent en Circulation dans les Pays:** ${totalBalance.toLocaleString()}$\n` +
            `**Nombre de Pays :** ${countries}\n` +
            `**Nombre de Staff :** ${data.staff.length}\n` +
            `**Ouverture :** <t:${Math.floor(new Date(serveurData.openingDate).getTime() / 1000)}:D>`,
        ),
      );

    const hasSocials = Object.values(serveurData.socials || {}).some(
      (v) => v && v.trim() !== "",
    );

    if (hasSocials) {
      container.addSeparatorComponents((s) => s);

      const socials = serveurData.socials || {};

      const buttons = Object.entries(socials)
        .filter(([_, value]) => value && value.trim() !== "")
        .map(([key, value]) => {
          const labels = {
            discord: {
              nom: "Discord",
              emoji: "1504798175989469184",
            },
            youtube: {
              nom: "YouTube",
              emoji: "1504835100783804480",
            },
            twitter: { nom: "X", emoji: "1504835099798274210" },
            tiktok: { nom: "TikTok", emoji: "1504835094970634390" },
            instagram: {
              nom: "Instagram",
              emoji: "1504835093473136760",
            },
          };

          return new ButtonBuilder()
            .setLabel(labels[key].nom || key)
            .setStyle(ButtonStyle.Link)
            .setEmoji(labels[key]?.emoji)
            .setURL(value);
        });

      const row = new ActionRowBuilder().addComponents(buttons.slice(0, 5));

      container.addActionRowComponents(row);
    }

    container
      .addSeparatorComponents((separator) => separator)
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("serveur")
            .setPlaceholder("Sélectionnez une option")
            .addOptions([
              {
                label: "Accueil",
                value: `serveur-${serveur}-Accueil`,
                default: true,
              },
              {
                label: "Staff",
                value: `serveur-${serveur}-Staff`,
              },
            ]),
        ),
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
