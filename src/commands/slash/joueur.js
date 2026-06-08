const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
} = require("discord.js");
const {
  getCachedEmojiTete,
  getEmojiTete,
} = require("../../../util/module/emoji");
const {
  editReplyIfCurrent,
  trackInteractionMessage,
} = require("../../../util/module/interactionMessageState");

function cleanHtml(input) {
  if (!input) return null;

  return input
    .replace(/\\u003C/g, "<")
    .replace(/\\u003E/g, ">")
    .replace(/<[^>]*>/g, "")
    .trim();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("joueur")
    .setDescription("Affiche les informations d'un joueur")
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

    await interaction.deferReply();

    const username = found.username;
    const profileRes = await fetch(
      `https://www.earthquest.fr/api/site/auth/profile/${encodeURIComponent(username)}`,
    );

    const profileData = await profileRes.json();
    const user = profileData.user;

    const buildContainer = (emoji = "<:tete_default:1504826518638034944>") => {
      const container = new ContainerBuilder()
        .setAccentColor(config.colors.normal)
        .addTextDisplayComponents((t) =>
          t.setContent(
            `## ${emoji} Information de ${user.username.replace(/_/g, "\\_")}${user.profileDescription ? `\n*${cleanHtml(user.profileDescription)}*` : ""}`,
          ),
        );

      if (user.forumSignature) {
        container.addTextDisplayComponents((t) =>
          t.setContent(
            `**Signature Forum :** ${cleanHtml(user.forumSignature)}`,
          ),
        );
      }

      const servers = user.serverProfiles || [];

      const translate = {
        RECRUIT: "Recrue",
        MEMBER: "Membre",
        OFFICER: "Officier",
        LEADER: "Chef",
      };

      servers.map((s) => {
        container
          .addSeparatorComponents((s) => s)
          .addTextDisplayComponents((t) =>
            t.setContent(
              `### ${config.emoji_formate[s.server_name]} Serveur ${s.server_display_name}\n` +
                `**Statut :** ${s.is_online ? "En ligne" : "Hors ligne"}\n` +
                `**Grade :** ${s.server_rank}\n` +
                `**Power :** ${s.power || 0}/${s.power_max || 0}\n` +
                `**Dernière Connexion :** <t:${Math.floor(new Date(s.last_seen_at).getTime() / 1000)}:R> • <t:${Math.floor(new Date(s.last_seen_at).getTime() / 1000)}:F>\n` +
                `**Pays :** ${s.faction_name || "Aucun Pays"}\n` +
                `**Rang :** ${translate[s.faction_role] || "Aucun Pays"}\n`,
            ),
          );
      });

      return container;
    };

    const initialEmoji = getCachedEmojiTete(
      username,
      "<:tete_default:1504826518638034944>",
    );

    await interaction.editReply({
      components: [
        buildContainer(initialEmoji || "<:tete_default:1504826518638034944>"),
      ],
      flags: MessageFlags.IsComponentsV2,
    });

    const tracker = await trackInteractionMessage(interaction);

    void (async () => {
      const emoji = await getEmojiTete(client, username);

      await editReplyIfCurrent(interaction, tracker, {
        components: [
          buildContainer(emoji || "<:tete_default:1504826518638034944>"),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    })();
  },
};
