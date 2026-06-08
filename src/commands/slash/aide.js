const {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
} = require("discord.js");

function formatOptions(command) {
  const options = command.data.options || [];

  return options
    .map((opt) => {
      const name = opt.name;

      if (opt.required) {
        return `<${name}>`;
      }

      return `[${name}]`;
    })
    .join(" ");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aide")
    .setDescription("Affiche la liste des commandes du robot"),

  async execute(client, interaction, config) {
    const commands = client.container.slashCmds;

    const list = [...commands.values()]
      .filter((cmd) => cmd.data.name !== "cmd")
      .map((cmd) => {
        const args = formatOptions(cmd);

        return `\`\`/${cmd.data.name}${args ? ` ${args}` : ""}\`\` : ${cmd.data.description || "Aucune description"}`;
      });

    const container = new ContainerBuilder()
      .setAccentColor(config.colors.normal)
      .addTextDisplayComponents((t) => t.setContent("## 📖 Aide du Robot"))
      .addSeparatorComponents((s) => s)
      .addTextDisplayComponents((t) => t.setContent(list.join("\n")));

    return interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
