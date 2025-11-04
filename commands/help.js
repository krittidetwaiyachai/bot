const { SlashCommandBuilder } = require('discord.js');
const { createHelpEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('แสดงหน้าต่างช่วยเหลือและวิธีใช้งาน'),

  async execute(interaction) {
    const helpEmbed = createHelpEmbed(interaction.client);

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};
