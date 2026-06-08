const {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  MessageFlags,
  ContainerBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const serveurs = require("../../../../util/option-serveur");

function getAllChunksFromPolygon(xList, zList) {
  const polygon = xList.map((x, i) => [
    Math.floor(x / 16),
    Math.floor(zList[i] / 16),
  ]);

  const xs = polygon.map((p) => p[0]);
  const zs = polygon.map((p) => p[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  function isInside(x, z, poly) {
    let inside = false;

    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0],
        zi = poly[i][1];
      const xj = poly[j][0],
        zj = poly[j][1];

      const intersect =
        zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }

  const chunks = [];

  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      if (isInside(x + 0.5, z + 0.5, polygon)) {
        chunks.push({ x, z });
      }
    }
  }

  return chunks;
}

module.exports = {
  data: {
    name: "pays",
  },

  async execute(client, interaction, config) {
    const [_, serveur, pays, categorie] = interaction.values[0].split("-");

    const res = await fetch(
      `https://www.earthquest.fr/api/site/public/servers/${serveur}/countries`,
    );

    const data = await res.json();
    const paysData = data.countries.find((p) => p.name === pays);

    if (!paysData) {
      const erreurContainer = new ContainerBuilder()
        .setAccentColor(config.colors.error)
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent("## ❌ Pays Introuvable"),
        )
        .addSeparatorComponents((separator) => separator)
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(
            "Ce pays n'existe pas ou n'a pas encore été resencé par EarthQuest.",
          ),
        );

      await interaction.editReply({
        components: [erreurContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    }

    const container = new ContainerBuilder()
      .setAccentColor(config.couleur[serveur])
      .addTextDisplayComponents((t) =>
        t.setContent(
          `## ${config.emoji_formate[serveur]} ${paysData.name} ${config.serveurName[serveur]}${categorie !== "Accueil" ? ` - ${categorie}` : ""}`,
        ),
      )
      .addSeparatorComponents((s) => s);

    if (categorie === "Accueil") {
      container.addTextDisplayComponents((t) =>
        t.setContent(
          `**Description :** ${paysData.description.replace(/§./g, "")}\n**Argent en Banque :** ${Math.floor(Number(paysData.money)).toLocaleString()}$\n**Power :** ${Math.floor(Number(paysData.power))}/${Math.floor(Number(paysData.powerMax))}\n**Nombre de Claim :** ${paysData.claimsCount}\n**Nombre de Membre :** ${paysData.memberCount}`,
        ),
      );
    }

    if (categorie === "Coordonnées") {
      const resDynmap = await fetch(
        `https://${serveur}.earthquest.fr/tiles/_markers_/marker_earth.json`,
      );

      const dataDynmap = await resDynmap.json();

      const dataPaysDynmap = Object.values(
        dataDynmap.sets["factions.markerset"].areas,
      ).filter((a) => a.label.toLowerCase() === pays.toLowerCase());

      const dataFHomeDynmap = Object.values(
        dataDynmap.sets["factions.markerset"].markers,
      ).find((a) => a.label.split(" ")[0].toLowerCase() === pays.toLowerCase());

      let chunks = 0;
      let areaTexte = "";

      for (const area of dataPaysDynmap) {
        chunks += getAllChunksFromPolygon(area.x, area.z).length;

        areaTexte += `\n- [${area.x[0]} 64 ${area.z[0]}](https://${serveur}.earthquest.fr/?worldname=earth&mapname=flat&zoom=4&x=${area.x[0]}&y=64&z=${area.z[0]})`;
      }

      const fhomeText = dataFHomeDynmap
        ? `**FHome :** [${Math.floor(dataFHomeDynmap.x)} ${dataFHomeDynmap.y} ${Math.floor(dataFHomeDynmap.z)}](https://${serveur}.earthquest.fr/?worldname=earth&mapname=flat&zoom=4&x=${Math.floor(dataFHomeDynmap.x)}&y=64&z=${Math.floor(dataFHomeDynmap.z)})`
        : `**FHome :** Aucun FHome`;

      const claimsText =
        dataPaysDynmap.length > 0
          ? `**Terre (${chunks} ${chunks > 1 ? "claims" : "claim"}) :**${areaTexte}`
          : `**Terre :** Ce pays ne possède pas de claim sur cette planète`;

      container
        .addTextDisplayComponents((t) => t.setContent(fhomeText))
        .addSeparatorComponents((s) => s)
        .addTextDisplayComponents((t) => t.setContent(claimsText));
    }

    container
      .addSeparatorComponents((separator) => separator)
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("pays")
            .setPlaceholder("Sélectionnez une option")
            .addOptions([
              {
                label: "Accueil",
                value: `pays-${serveur}-${paysData.name}-Accueil`,
                default: categorie === "Accueil",
              },
              {
                label: "Coordonnées",
                value: `pays-${serveur}-${paysData.name}-Coordonnées`,
                default: categorie === "Coordonnées",
              },
            ]),
        ),
      );

    await interaction.update({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
