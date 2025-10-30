// /commands/export-data.js
const {
  SlashCommandBuilder,
  PermissionsBitField,
  AttachmentBuilder,
} = require('discord.js');
const { BOT_CONFIG, EXPORT_CHANNEL_ID } = require('../config');
const { getAllPlayers } = require('../utils/database');
const { Buffer } = require('node:buffer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('export-data')
    .setDescription('ส่งออกข้อมูลผู้เล่นทั้งหมดไปยังช่องที่ตั้งค่าไว้ (เฉพาะแอดมิน)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    if (!EXPORT_CHANNEL_ID) {
      return interaction.editReply({
        content: '❌ ยังไม่ได้ตั้งค่า `EXPORT_CHANNEL_ID` ใน .env',
      });
    }

    let targetChannel;
    try {
      targetChannel = await interaction.client.channels.fetch(EXPORT_CHANNEL_ID);
      if (!targetChannel || !targetChannel.isTextBased()) {
        throw new Error('ID ช่อง ไม่ใช่ Text Channel');
      }
    } catch (error) {
      return interaction.editReply({
        content: `❌ ตั้งค่า \`EXPORT_CHANNEL_ID\` ผิดพลาด: ${error.message}`,
      });
    }

    // 1. ดึงข้อมูลจาก DB
    const dbResult = await getAllPlayers();

    if (!dbResult.success) {
      return interaction.editReply({
        content: `❌ ดึงข้อมูล DB ล้มเหลว: ${dbResult.error}`,
      });
    }
    if (!dbResult.data || dbResult.data.length === 0) {
      return interaction.editReply({
        content: 'ℹ️ ไม่พบข้อมูลผู้เล่นในฐานข้อมูล',
      });
    }

    try {
      // 2. แปลงข้อมูลเป็น JSON Buffer (ไฟล์)
      const jsonData = JSON.stringify(dbResult.data, null, 2);
      const buffer = Buffer.from(jsonData, 'utf-8');

      // 3. สร้างไฟล์แนบ
      const attachment = new AttachmentBuilder(buffer, {
        name: 'player_data.export.json',
      });

      // 4. ส่งไฟล์ไปยังช่องที่ล็อกไว้
      await targetChannel.send({
        content: `📦 **Database Export**\nส่งออกข้อมูลผู้เล่นทั้งหมด ${
          dbResult.data.length
        } รายการ (ส่งโดย ${interaction.user.tag})`,
        files: [attachment],
      });

      // 5. ตอบกลับ (แบบลับ) ว่าสำเร็จ
      await interaction.editReply({
        content: `✅ ส่งออกข้อมูล ${dbResult.data.length} รายการไปยังช่อง ${targetChannel.name} สำเร็จ!`,
      });
    } catch (error) {
      console.error('❌ (Export) ส่งออกข้อมูลล้มเหลว:', error);
      await interaction.editReply({
        content: `❌ เกิดข้อผิดพลาดขณะส่งไฟล์: ${error.message}`,
      });
    }
  },
};