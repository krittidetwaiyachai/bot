const { PANEL_CHANNEL_ID } = require('../config');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `[System] Command ไม่พบคำสั่งที่ตรงกับ ${interaction.commandName}`
      );
      return;
    }

    if (
      command.data.name === 'verify' &&
      interaction.channelId !== PANEL_CHANNEL_ID
    ) {
      let channelName = 'ช่องที่กำหนด';
      try {
        const correctChannel = await interaction.client.channels.fetch(
          PANEL_CHANNEL_ID
        );
        if (correctChannel) {
          channelName = `<#${correctChannel.id}>`;
        }
      } catch (e) {
        console.error(
          `[System] Verify Check ไม่พบ PANEL_CHANNEL_ID ที่ตั้งค่าไว้: ${PANEL_CHANNEL_ID}`
        );
      }

      return interaction.reply({
        content: `❌ คุณสามารถใช้คำสั่ง \`/verify\` ได้ใน ${channelName} เท่านั้นครับ`,
        ephemeral: true,
      });
    }

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
