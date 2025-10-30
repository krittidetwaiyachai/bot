// /events/interactionCreate.js
const { PANEL_CHANNEL_ID } = require('../config'); // <-- 1. Import Config

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `ไม่พบคำสั่งที่ตรงกับ ${interaction.commandName}`
      );
      return;
    }

    // --- 2. (เพิ่มใหม่) ตรวจสอบช่องสำหรับ /verify ---
    if (
      command.data.name === 'verify' &&
      interaction.channelId !== PANEL_CHANNEL_ID
    ) {
      // ถ้าเป็นคำสั่ง /verify แต่ไม่ได้ใช้ในช่องที่กำหนด

      // ดึงชื่อช่องที่ถูกต้องมา (เผื่อ ID ผิด)
      let channelName = 'ช่องที่กำหนด';
      try {
        const correctChannel = await interaction.client.channels.fetch(
          PANEL_CHANNEL_ID
        );
        if (correctChannel) {
          channelName = `<#${correctChannel.id}>`; // ทำให้สามารถคลิกได้
        }
      } catch (e) {
        console.error(
          `(Verify Check) ไม่พบ PANEL_CHANNEL_ID ที่ตั้งค่าไว้: ${PANEL_CHANNEL_ID}`
        );
      }

      return interaction.reply({
        content: `❌ คุณสามารถใช้คำสั่ง \`/verify\` ได้ใน ${channelName} เท่านั้นครับ`,
        ephemeral: true,
      });
    }
    // --- สิ้นสุดการตรวจสอบ ---

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ เกิดข้อผิดพลาดขณะรันคำสั่งนี้!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '❌ เกิดข้อผิดพลาดขณะรันคำสั่งนี้!',
          ephemeral: true,
        });
      }
    }
  },
};
