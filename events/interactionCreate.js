const {
  PANEL_CHANNEL_ID,
  VERIFY_CATEGORY_ID,
  BOT_CONFIG,
} = require('../config');
const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `[System] Command ไม่พบคำสั่งที่ตรงกับ ${interaction.commandName}`
        );
        return;
      }

      /* //
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
      */

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
    }
    else if (interaction.isButton()) {
      if (interaction.customId === 'start_verify') {
        await handleStartVerify(interaction);
      } else if (interaction.customId === 'close_verify_channel') {
        await handleCloseVerify(interaction);
      }
    }
  },
};

async function handleStartVerify(interaction) {
  await interaction.deferReply({ ephemeral: true });

  if (!VERIFY_CATEGORY_ID) {
    return interaction.editReply({
      content: '❌ (แอดมิน) ยังไม่ได้ตั้งค่า `VERIFY_CATEGORY_ID` ใน .env',
    });
  }

  const guild = interaction.guild;
  const user = interaction.user;

  const existingChannel = guild.channels.cache.find(
    (c) =>
      c.name === `verify-${user.id}` && c.parentId === VERIFY_CATEGORY_ID
  );

  if (existingChannel) {
    return interaction.editReply({
      content: `❌ คุณมีช่องยืนยันที่เปิดอยู่แล้ว: ${existingChannel}`,
    });
  }

  try {
    const channel = await guild.channels.create({
      name: `verify-${user.id}`,
      type: ChannelType.GuildText,
      parent: VERIFY_CATEGORY_ID,
      topic: `ช่องยืนยันสลิปสำหรับ ${user.tag} (ID: ${user.id})`,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.AttachFiles,
          ],
        },
        {
          id: interaction.client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setColor(BOT_CONFIG.embeds.help.color)
      .setTitle('📝 ช่องยืนยันสลิป')
      .setDescription(
        'กรุณาอัพโหลด **รูปภาพสลิป** ของคุณในช่องนี้ (1 รูปต่อครั้ง) บอทจะทำการตรวจสอบและเติมพ้อยให้คุณอัตโนมัติ'
      )
      .addFields({
        name: '🏦 ข้อมูลการโอน',
        value:
          BOT_CONFIG.embeds.help.fields.verifyCommandValue.split('\n\n')[1] ||
          'ธนาคาร กสิกรไทย\nเลขบัญชี 123-4-56789-0\nชื่อบัญชี นายสมชาย ใจดี',
      })
      .setFooter({ text: 'บอทจะอ่านรูปภาพที่คุณส่งในช่องนี้เท่านั้น' });

    const closeButton = new ButtonBuilder()
      .setCustomId('close_verify_channel')
      .setLabel('🔒 ปิดช่องนี้')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    await channel.send({
      content: `ยินดีต้อนรับ, ${user}!`,
      embeds: [embed],
      components: [row],
    });

    await interaction.editReply({
      content: `✅ สร้างช่องส่วนตัวให้คุณเรียบร้อยแล้ว! ${channel}`,
    });
  } catch (error) {
    console.error('[System] ไม่สามารถสร้างช่อง Verify ได้:', error);
    await interaction.editReply({
      content: `❌ เกิดข้อผิดพลาดในการสร้างช่อง: ${error.message}`,
    });
  }
}

async function handleCloseVerify(interaction) {
  const channel = interaction.channel;
  if (
    channel.parentId !== VERIFY_CATEGORY_ID ||
    !channel.name.startsWith('verify-')
  ) {
    return interaction.reply({
      content: '❌ ไม่สามารถใช้ปุ่มนี้ในช่องนี้ได้',
      ephemeral: true,
    });
  }

  try {
    const row = new ActionRowBuilder().addComponents(
      ButtonBuilder.from(interaction.component)
        .setDisabled(true)
        .setLabel('กำลังปิด...')
    );
    await interaction.update({ components: [row] });
  } catch (e) {
  }

  await channel.send({ content: '✅ กำลังลบช่องนี้ใน 5 วินาที...' });
  setTimeout(async () => {
    try {
      await channel.delete('User closed verification ticket');
    } catch (error) {
      console.error(`[System] ไม่สามารถลบช่อง ${channel.name} ได้:`, error);
    }
  }, 5000);
}

