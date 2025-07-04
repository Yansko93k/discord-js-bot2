require("dotenv").config();
require("module-alias/register");

// register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

validateConfiguration();

// initialize client
const path = require('path');
const client = new BotClient();

client.loadCommands(path.join(__dirname, 'src', 'commands'));
client.loadContexts(path.join(__dirname, 'src', 'contexts'));
client.loadEvents(path.join(__dirname, 'src', 'events'));


// find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));

const deployCommands = require('./deploy-commands');
const express = require('express');
const app = express();

(async () => {
  // check for updates
  await checkForUpdates();

  // start the dashboard or initialize database
  if (client.config.DASHBOARD.enabled) {
    client.logger.log("Launching dashboard");
    try {
      const { launch } = require("@root/dashboard/app");

      // let the dashboard initialize the database
      await launch(client);
    } catch (ex) {
      client.logger.error("Failed to launch dashboard", ex);
    }
  } else {
    // initialize the database
    await initializeMongoose();
  }

  try {
    await deployCommands();
    console.log('Commandes déployées automatiquement au démarrage');
  } catch (error) {
    console.error('Erreur lors du déploiement des commandes:', error);
  }

  await client.login(process.env.BOT_TOKEN);

  app.get('/', (req, res) => res.send('Bot is running!'));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
})();

