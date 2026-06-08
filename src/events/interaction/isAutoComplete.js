const log = require("../../../util/module/log");

module.exports = async (client, interaction) => {
  const slashCmd = client.container.slashCmds.get(interaction.commandName);
  if (!slashCmd) return;

  try {
    const { name, value } = interaction.options.getFocused(true);

    if (name === "pseudo") {
      if (!value || value.length < 1) return interaction.respond([]);

      const response = await fetch(
        `https://www.earthquest.fr/api/site/public/players/search?q=${encodeURIComponent(value)}`,
      );

      if (!response.ok) {
        console.log(response);
        return interaction.respond([]);
      }

      const data = await response.json();

      const players = (data.players || []).slice(0, 25).map((player) => ({
        name: player.username,
        value: player.username,
      }));

      await interaction.respond(players);
    } else if (name === "pays") {
      const serveur = interaction.options.get("serveur")?.value;

      if (!serveur) {
        return interaction.respond([]);
      }

      const response = await fetch(
        `https://www.earthquest.fr/api/site/public/servers/${encodeURIComponent(serveur)}/countries`,
      );

      if (!response.ok) {
        return interaction.respond([]);
      }

      const data = await response.json();

      const countries = (data.countries || [])
        .filter((country) =>
          country.name.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 25)
        .map((country) => ({
          name: country.name,
          value: country.id,
        }));

      await interaction.respond(countries);
    }
  } catch (e) {
    await interaction.respond([]);
    log(e, "error", "red");
  }
};
