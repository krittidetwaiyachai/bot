// /commands/help.js
const { SlashCommandBuilder } = require('discord.js');
const { createHelpEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('แสดงหน้าต่างช่วยเหลือและวิธีใช้งาน'),

  async execute(interaction) {
    // สร้าง Embed จากฟังก์ชันกลาง
    const helpEmbed = createHelpEmbed(interaction.client);

    // ตอบกลับแบบเห็นเฉพาะคนถาม (ephemeral)
    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};