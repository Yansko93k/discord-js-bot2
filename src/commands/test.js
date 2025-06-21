const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('test').setDescription('Commande de test'),
  async execute(interaction) {
    await interaction.reply('Commande test exécutée !');
  }
};

