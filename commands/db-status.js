// /commands/db-status.js
const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { checkDbConnection } = require('../utils/database'); // ‹--- เราจะสร้างฟังก์ชันนี้ต่อ
const { BOT_CONFIG } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('db-status')
    .setDescription('ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล (เฉพาะแอดมิน)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // ‹--- จำกัดสิทธิ์

  async execute(interaction) {
    // เช็กสิทธิ์แอดมินอีกรอบ
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // เรียกฟังก์ชันเช็ก DB
    const result = await checkDbConnection();

    const embed = new EmbedBuilder()
      .setTitle('📊 สถานะการเชื่อมต่อฐานข้อมูล')
      .setTimestamp();

    if (result.success) {
      embed
        .setColor(BOT_CONFIG.embeds.success.color)
        .setDescription(result.message);
    } else {
      embed
        .setColor(BOT_CONFIG.embeds.error.color)
        .setDescription(result.message);
    }

    await interaction.editReply({ embeds: [embed] });
  },
};