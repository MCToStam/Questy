const { ActivityType } = require("discord.js");
const cron = require("node-cron");
const { botLaunch } = require("../../../main");
const log = require("../../../util/module/log");
const config = require("../../../config");
const checkAlerteConnexion = require("../../../util/alerte/checkAlerteConnexion");

const { checkEmojiCache } = require("../../../util/module/emoji");

async function cycleStatus(client) {
  const guilds = client.guilds.cache.size;

  client.user.setPresence({
    activities: [
      {
        name: `Questy | /aide | ${guilds} serveur${guilds > 1 ? "s" : ""}`,
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  setTimeout(() => {
    cycleStatus(client);
  }, 30 * 1000);
}

module.exports = async (client, interaction) => {
  const botStart = new Date();
  const latence = (botStart.getTime() - botLaunch[0].getTime()) / 1000;

  const guilds = client.guilds.cache.size;
  const usersCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

  log(
    `${client.user.username} est pret en ${latence.toFixed(
      1,
    )}s, sur ${guilds} serveurs et ${usersCount} utilisateurs.`,
    "READY",
    "green",
  );

  await cycleStatus(client);

  cron.schedule("* * * * *", async () => {
    for (const serveur of config.liste_serveur) {
      await checkAlerteConnexion(client, serveur);
    }
  });

  process.on("unhandledRejection", (reason, p) => {
    console.log(" [antiCrash] :: Unhandled Rejection/Catch");
    console.log(reason, p);
  });
  process.on("uncaughtException", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch");
    console.log(err, origin);
  });
  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
  });

  await checkEmojiCache(client);
};
