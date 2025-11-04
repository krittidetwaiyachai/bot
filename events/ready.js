const { PANEL_CHANNEL_ID } = require('../config');
const { createHelpEmbed } = require('../utils/embeds');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`[System] Bot เข้าสู่ระบบในชื่อ ${client.user.tag}`);
    console.log('[System] พร้อมใช้งานแล้ว!');

    if (!PANEL_CHANNEL_ID) {
      console.warn(
        '[System] ไม่ได้ตั้งค่า PANEL_CHANNEL_ID ใน .env บอทจะไม่ส่ง Embed แนะนำการใช้งาน'
      );
      return;
    }

    try {
      const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

      if (channel && channel.isTextBased()) {
        console.log(`[System] Panel กำลังค้นหา Embed เก่าในช่อง ${channel.name}...`);
        const messages = await channel.messages.fetch({ limit: 50 });
        const botMessages = messages.filter(
          (msg) => msg.author.id === client.user.id
        );

        if (botMessages.size > 0) {
          console.log(
            `[System] Panel พบ ${botMessages.size} Embed เก่า กำลังลบ...`
          );
          await channel.bulkDelete(botMessages);
          console.log('[System] Panel ลบ Embed เก่าสำเร็จ');
        } else {
          console.log('[System] Panel ไม่พบ Embed เก่า');
        }

        const embed = createHelpEmbed(client);

        const startButton = new ButtonBuilder()
          .setCustomId('start_verify')
          .setLabel('🚀 เริ่มการยืนยัน')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(startButton);

        await channel.send({ embeds: [embed], components: [row] });
        console.log(
          `[System] ส่ง Embed แนะนำการใช้งานไปที่ช่อง ${channel.name} เรียบร้อย`
        );
      } else {
        console.error(
          `[System] ไม่พบช่อง ID: ${PANEL_CHANNEL_ID} หรือช่องนี้ไม่ใช่ Text Channel`
        );
      }
    } catch (error) {
      console.error('[System] เกิดข้อผิดพลาดในการส่ง Embed แนะนำการใช้งาน:', error);
    }
  },
};

