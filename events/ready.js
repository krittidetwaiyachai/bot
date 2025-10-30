// /events/ready.js
const { PANEL_CHANNEL_ID } = require('../config');
const { createHelpEmbed } = require('../utils/embeds');

module.exports = {
  name: 'clientReady', // ใช้ clientReady แทน ready
  once: true,
  async execute(client) {
    console.log(`✅ Bot เข้าสู่ระบบในชื่อ ${client.user.tag}`);
    console.log('พร้อมใช้งานแล้ว!');

    // --- ส่วนของการส่ง Panel ---
    if (!PANEL_CHANNEL_ID) {
      console.warn(
        '⚠️ ไม่ได้ตั้งค่า PANEL_CHANNEL_ID ใน .env บอทจะไม่ส่ง Embed แนะนำการใช้งาน'
      );
      return;
    }

    try {
      const channel = await client.channels.fetch(PANEL_CHANNEL_ID);

      if (channel && channel.isTextBased()) {
        // --- 1. (ใหม่) ลบ Embed เก่าของบอท ---
        console.log(`(Panel) กำลังค้นหา Embed เก่าในช่อง ${channel.name}...`);
        const messages = await channel.messages.fetch({ limit: 50 }); // ดึง 50 ข้อความล่าสุด
        const botMessages = messages.filter(
          (msg) => msg.author.id === client.user.id
        );

        if (botMessages.size > 0) {
          console.log(
            `(Panel) พบ ${botMessages.size} Embed เก่า กำลังลบ...`
          );
          await channel.bulkDelete(botMessages);
          console.log('(Panel) ลบ Embed เก่าสำเร็จ');
        } else {
          console.log('(Panel) ไม่พบ Embed เก่า');
        }

        // --- 2. ส่ง Embed ใหม่ ---
        const embed = createHelpEmbed(client);
        await channel.send({ embeds: [embed] });
        console.log(
          `✅ ส่ง Embed แนะนำการใช้งานไปที่ช่อง ${channel.name} เรียบร้อย`
        );
      } else {
        console.error(
          `❌ ไม่พบช่อง ID: ${PANEL_CHANNEL_ID} หรือช่องนี้ไม่ใช่ Text Channel`
        );
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการส่ง Embed แนะนำการใช้งาน:', error);
    }
  },
};
