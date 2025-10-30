// /events/interactionCreate.js
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