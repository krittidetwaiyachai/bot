const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { getInGameName } = require('../utils/database');
const { BOT_CONFIG } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sr')
    .setDescription('ค้นหาชื่อในเกมจาก Discord ID (เฉพาะแอดมิน)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addStringOption(option =>
      option.setName('discord_id')
        .setDescription('Discord ID ของผู้ใช้ที่ต้องการค้นหา')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้',
        ephemeral: true,
      });
    }

    const discordId = interaction.options.getString('discord_id');

    await interaction.deferReply({ ephemeral: true });

    const inGameName = await getInGameName(discordId);

    if (inGameName) {
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.embeds.success.color)
        .setTitle('🔍 ค้นหาข้อมูลผู้ใช้สำเร็จ')
        .addFields(
          { name: 'Discord ID', value: `\`${discordId}\`` },
          { name: 'ชื่อในเกม (In-Game Name)', value: `\`${inGameName}\`` }
        )
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });

    } else {
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.embeds.error.color)
        .setTitle('⚠️ ไม่พบข้อมูล')
        .setDescription(`ไม่พบชื่อในเกมที่ผูกกับ Discord ID: \`${discordId}\`\n(อาจยังไม่ได้เชื่อมต่อบัญชี หรือ ID ผิด)`)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
