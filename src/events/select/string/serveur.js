const {
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  MessageFlags,
  ContainerBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const serveurs = require("../../../../util/option-serveur");

module.exports = {
  data: {
    name: "serveur",
  },

  async execute(client, interaction, config) {
    const [_, serveur, categorie] = interaction.values[0].split("-");

    const res = await fetch(
      `https://www.earthquest.fr/api/site/public/servers/${serveur}/full`,
    );

    const data = await res.json();

    const serveurData = data.server;

    const container = new ContainerBuilder()
      .setAccentColor(parseInt(serveurData.colorHex.replace("#", ""), 16))
      .addTextDisplayComponents((t) =>
        t.setContent(
          `## ${config.serveur[serveur].emoji_formate} Serveur ${serveurData.displayName}${categorie !== "Accueil" ? ` - ${categorie}` : ""}${
            serveurData.description ? `\n*${serveurData.description}*` : ""
          }`,
        ),
      )
      .addSeparatorComponents((s) => s);

    if (categorie === "Accueil") {
      const STAFF_COUNTRIES = ["warzone", "safezone"];

      const totalBalance = data.countries.reduce((sum, p) => {
        return sum + Math.floor(Number(p.money));
      }, 0);

      const countries = data.countries.filter(
        (p) => !p.id.includes(STAFF_COUNTRIES),
      ).length;

      container.addTextDisplayComponents((t) =>
        t.setContent(
          `**Joueur${serveurData.onlinePlayers.length > 1 ? "s" : ""} Connecté${
            serveurData.onlinePlayers.length > 1 ? "s" : ""
          } :** ${serveurData.onlinePlayers}/${serveurData.maxPlayers || 150}\n` +
            `**Argent en Circulation dans les Pays:** ${totalBalance.toLocaleString()}$\n` +
            `**Nombre de Pays :** ${countries}\n` +
            `**Nombre de Staff :** ${data.staff.length}\n` +
            `**Ouverture :** <t:${Math.floor(
              new Date(serveurData.openingDate).getTime() / 1000,
            )}:D>`,
        ),
      );

      const hasSocials = Object.values(serveurData.socials || {}).some(
        (v) => v && v.trim() !== "",
      );

      if (hasSocials) {
        container.addSeparatorComponents((s) => s);

        const labels = {
          discord: { nom: "Discord", emoji: "1504798175989469184" },
          youtube: { nom: "YouTube", emoji: "1504835100783804480" },
          twitter: { nom: "X", emoji: "1504835099798274210" },
          tiktok: { nom: "TikTok", emoji: "1504835094970634390" },
          instagram: { nom: "Instagram", emoji: "1504835093473136760" },
        };

        const buttons = Object.entries(serveurData.socials || {})
          .filter(([_, v]) => v && v.trim() !== "")
          .map(([key, value]) =>
            new ButtonBuilder()
              .setLabel(labels[key]?.nom || key)
              .setStyle(ButtonStyle.Link)
              .setEmoji(labels[key]?.emoji)
              .setURL(value),
          );

        container.addActionRowComponents(
          new ActionRowBuilder().addComponents(buttons.slice(0, 5)),
        );
      }
    }

    if (categorie === "Staff") {
      const staffSorted = [...data.staff].sort(
        (a, b) => b.gradeRankOrder - a.gradeRankOrder,
      );

      const gradeOrder = [
        "adminstrateur",
        "supermodo",
        "modérateur vétéran",
        "modérateur",
        "modérateur test",
        "assistant",
      ];

      const gradeLabels = {
        assistant: { normal: "Assistant", plural: "Assistants" },
        "modérateur test": {
          normal: "Modérateur Test",
          plural: "Modérateurs Tests",
        },
        modérateur: { normal: "Modérateur", plural: "Modérateurs" },
        "modérateur vétéran": {
          normal: "Modérateur Vétéran",
          plural: "Modérateurs Vétérans",
        },
        supermodo: { normal: "Super Modérauteur", plural: "Super Modérauteur" },
        adminstrateur: { normal: "Administrateur", plural: "Administrateurs" },
      };

      const filtered = staffSorted.filter((m) =>
        gradeOrder.includes(m.grade.toLowerCase()),
      );

      const grouped = filtered.reduce((acc, member) => {
        const key = member.grade.toLowerCase();

        if (!acc[key]) acc[key] = [];
        acc[key].push(member.username);

        return acc;
      }, {});

      gradeOrder
        .filter((grade) => grouped[grade])
        .forEach((grade, index, arr) => {
          const users = grouped[grade];

          const label =
            (users.length > 1
              ? gradeLabels[grade]?.plural
              : gradeLabels[grade]?.normal) || grade;

          container.addTextDisplayComponents((t) =>
            t.setContent(
              `**${label} (${users.length}) :**\n${users
                .join(", ")
                .replace(/_/g, "\\_")}`,
            ),
          );

          if (index !== arr.length - 1) {
            container.addSeparatorComponents((s) => s);
          }
        });
    }

    container
      .addSeparatorComponents((s) => s)
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("serveur")
            .setPlaceholder("Sélectionnez une option")
            .addOptions([
              {
                label: "Accueil",
                value: `serveur-${serveur}-Accueil`,
                default: categorie === "Accueil",
              },
              {
                label: "Staff",
                value: `serveur-${serveur}-Staff`,
                default: categorie === "Staff",
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
