const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const serveurs = require("../../../util/option-serveur");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sous-power")
    .setDescription("Affiche les pays en sous-power")
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
      `https://www.earthquest.fr/api/site/public/servers/${encodeURIComponent(serveur)}/countries`,
    );
    const data = await res.json();

    const resDynmap = await fetch(
      `https://${serveur}.earthquest.fr/tiles/_markers_/marker_earth.json`,
    );
    const dataDynmap = await resDynmap.json();

    const STAFF_COUNTRIES = ["warzone", "safezone"];
    const sousPowerCountries = data.countries
      .filter(
        (country) => !STAFF_COUNTRIES.includes(country.name.toLowerCase()),
      )
      .map((country) => ({
        ...country,
        marge: country.power - country.claimsCount,
      }))
      .sort((a, b) => a.marge - b.marge);

    const page = 0;
    const totalPages = Math.ceil(sousPowerCountries.length / 7);
    const pageData = sousPowerCountries.slice(page * 7, (page + 1) * 7);

    const container = new ContainerBuilder()
      .setAccentColor(config.couleur[serveur])
      .addTextDisplayComponents((t) =>
        t.setContent(`## ${config.emoji_formate[serveur]} Pays en Sous-Power`),
      )
      .addSeparatorComponents((s) => s);

    pageData.forEach((country) => {
      let coordTexte = "";
      const dataFHomeDynmap = Object.values(
        dataDynmap.sets["factions.markerset"].markers,
      ).find(
        (a) =>
          a.label.split(" ")[0].toLowerCase() === country.name.toLowerCase(),
      );

      if (dataFHomeDynmap) {
        coordTexte = `[${Math.floor(dataFHomeDynmap.x)} ${dataFHomeDynmap.y} ${Math.floor(dataFHomeDynmap.z)}](https://${serveur}.earthquest.fr/?worldname=earth&mapname=flat&zoom=4&x=${Math.floor(dataFHomeDynmap.x)}&y=${Math.floor(dataFHomeDynmap.y)}&z=${Math.floor(dataFHomeDynmap.z)})`;
      } else {
        const dataPaysDynmap = Object.values(
          dataDynmap.sets["factions.markerset"].areas,
        ).filter((a) => a.label.toLowerCase() === country.name.toLowerCase());

        if (dataPaysDynmap.length > 1) {
          coordTexte = `[${Math.floor(dataPaysDynmap[0].x[0])} 64 ${Math.floor(dataPaysDynmap[0].z[0])}](https://${serveur}.earthquest.fr/?worldname=earth&mapname=flat&zoom=4&x=${dataPaysDynmap[0].x[0]}&y=64&z=${dataPaysDynmap[0].z[0]})`;
        }
      }

      const marge = country.marge;
      const absM = Math.abs(marge);
      const lettre = absM <= 1 ? "" : "s";

      const statLine =
        marge < 0
          ? `${Math.floor(absM)} chunk${lettre} pillable${lettre}`
          : `${Math.floor(marge)} claim${lettre} de marge`;

      container.addTextDisplayComponents((t) =>
        t.setContent(
          `${marge < 0 ? "<:attention:1513637348817244201> " : ""}**${country.name}** : ${statLine}\n↪ ${coordTexte ? `${coordTexte} | ` : ""}Argent : ${Math.floor(country.money).toLocaleString()}$`,
        ),
      );
    });

    container
      .addSeparatorComponents((s) => s)
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`souspower-0-${serveur}-min`)
            .setEmoji({ name: "⏪" })
            .setDisabled(page <= 0)
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`souspower-${page - 1}-${serveur}`)
            .setEmoji({ name: "◀️" })
            .setDisabled(page <= 0)
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("souspower")
            .setLabel(`Page ${page + 1}/${totalPages}`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`souspower-${page + 1}-${serveur}`)
            .setEmoji({ name: "▶️" })
            .setDisabled(page >= totalPages - 1)
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`souspower-${totalPages - 1}-${serveur}-max`)
            .setEmoji({ name: "⏩" })
            .setDisabled(page >= totalPages - 1)
            .setStyle(ButtonStyle.Primary),
        ),
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
