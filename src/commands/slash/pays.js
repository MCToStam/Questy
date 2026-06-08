const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
} = require("discord.js");

const serveurs = require("../../../util/option-serveur");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pays")
    .setDescription("Affiche les informations d'un pays")
    .addStringOption((option) =>
      option
        .setName("serveur")
        .setDescription("Le serveur")
        .setRequired(true)
        .addChoices(...serveurs),
    )
    .addStringOption((option) =>
      option
        .setName("pays")
        .setDescription("Le pays")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async execute(client, interaction, config) {
    const serveur = interaction.options.getString("serveur");
    const pays = interaction.options.getString("pays");

    const res = await fetch(
      `https://www.earthquest.fr/api/site/public/servers/${encodeURIComponent(serveur)}/countries/${encodeURIComponent(pays)}`,
    );

    const data = await res.json();

    if (data.error === "COUNTRY_NOT_FOUND") {
      const container = new ContainerBuilder()
        .setAccentColor(config.colors.error)
        .addTextDisplayComponents((t) => t.setContent("## ❌ Pays Inconnu"))
        .addSeparatorComponents((s) => s)
        .addTextDisplayComponents((t) =>
          t.setContent("Le pays spécifié n'a pas été trouvé."),
        );

      return interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    const container = new ContainerBuilder()
      .setAccentColor(config.couleur[serveur])
      .addTextDisplayComponents((t) =>
        t.setContent(
          `## ${config.emoji_formate[serveur]} ${data.country.name} ${config.serveurName[serveur]}`,
        ),
      )
      .addSeparatorComponents((s) => s)
      .addTextDisplayComponents((t) =>
        t.setContent(
          `**Description :** ${data.country.description.replace(/§./g, "")}\n**Argent en Banque :** ${Math.floor(Number(data.country.money)).toLocaleString()}$\n**Power :** ${Math.floor(Number(data.country.power))}/${Math.floor(Number(data.country.powerMax))}\n**Nombre de Claim :** ${data.country.claimsCount}\n**Nombre de Membre :** ${data.country.memberCount}`,
        ),
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
