const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { verifySlipFromImage } = require('../utils/slipok');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');
const { getInGameName } = require('../utils/database');
const {
  RCON_CHANNEL_ID,
  POINT_RATE,
  ADMIN_LOG_CHANNEL_ID,
} = require('../config');
const { logPurchase } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('ตรวจสอบสลิปการโอนเงิน')
    .addAttachmentOption((option) =>
      option
        .setName('slip')
        .setDescription('รูปภาพสลิปการโอนเงิน')
        .setRequired(true)
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment('slip');

    if (
      !attachment.contentType ||
      !attachment.contentType.startsWith('image/')
    ) {
      await interaction.reply({
        content: '❌ กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น (JPG, PNG, JPEG, WEBP)',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const result = await verifySlipFromImage(attachment.url, null);

    if (result.success) {
      const slipData = result.data;
      const discordId = interaction.user.id;
      const amount = slipData.amount;

      const embed = createSuccessEmbed(slipData);

      const inGameName = await getInGameName(discordId);

      if (!inGameName) {
        embed.addFields({
          name: '⚠️ สถานะการเติมเงิน',
          value:
            'สลิปถูกต้อง แต่ไม่พบชื่อของคุณในฐานข้อมูล! กรุณาติดต่อแอดมินเพื่อเชื่อมต่อบัญชี',
        });
      } else if (!amount || amount <= 0) {
        embed.addFields({
          name: '⚠️ สถานะการเติมเงิน',
          value: `สลิปถูกต้อง แต่ไม่สามารถอ่านยอดเงินได้ (ยอด ${amount} บาท)`,
        });
      } else {
        try {
          const rconChannel = await interaction.client.channels.fetch(
            RCON_CHANNEL_ID
          );

          if (!rconChannel || !rconChannel.isTextBased()) {
            throw new Error('ไม่พบช่อง RCON หรือช่องนั้นไม่ใช่ Text Channel');
          }

          const bahtAmount = Math.floor(amount);
          const calculatedPoints = bahtAmount * POINT_RATE;

          const rconCommand = `!rcon coinsengine:point give ${inGameName} ${calculatedPoints}`;

          await rconChannel.send(rconCommand);

          embed.addFields({
            name: '💸 สถานะการเติมเงิน',
            value: `✅ ระบบได้ทำการเติมพ้อยให้ \`${inGameName}\` จำนวน \`${calculatedPoints.toLocaleString()}\` พ้อย เรียบร้อย!`,
          });

          try {
            await logPurchase(
              interaction.user,
              inGameName,
              bahtAmount,
              calculatedPoints
            );
          } catch (logError) {
            console.error(
              '[System] Logger บันทึก Log ล้มเหลว (แต่การเติมเงินสำเร็จ):',
              logError
            );
          }

          if (ADMIN_LOG_CHANNEL_ID) {
            try {
              const adminLogChannel = await interaction.client.channels.fetch(
                ADMIN_LOG_CHANNEL_ID
              );
              if (adminLogChannel && adminLogChannel.isTextBased()) {
                const adminEmbed = new EmbedBuilder()
                  .setColor(0x57f287)
                  .setTitle('📄 บันทึกการเติมเงิน (แอดมิน)')
                  .addFields(
                    {
                      name: '👤 ผู้ใช้งาน Discord',
                      value: `${interaction.user.tag} (\`${interaction.user.id}\`)`,
                      inline: false,
                    },
                    {
                      name: '🎮 ชื่อในเกม',
                      value: `\`${inGameName}\``,
                      inline: false,
                    },
                    {
                      name: '💰 จำนวนเงิน (บาท)',
                      value: `${bahtAmount} บาท`,
                      inline: true,
                    },
                    {
                      name: '🪙 จำนวน (พ้อย)',
                      value: `${calculatedPoints.toLocaleString()} พ้อย (Rate: ${POINT_RATE}x)`,
                      inline: true,
                    }
                  )
                  .setTimestamp();
                await adminLogChannel.send({ embeds: [adminEmbed] });
              }
            } catch (adminLogError) {
              console.error(
                '[System] Admin Log ส่ง Embed ไปห้องแอดมินล้มเหลว:',
                adminLogError
              );
            }
          }
        } catch (error) {
          console.error('[System] RCON ส่งคำสั่งล้มเหลว:', error);
          embed.addFields({
            name: '🔥 สถานะการเติมเงิน',
            value: `สลิปถูกต้อง แต่การเติมพ้อยให้ \`${inGameName}\` ล้มเหลว กรุณาติดต่อแอดมินโดยด่วน!`,
          });
        }
      }

      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = createErrorEmbed(result.error.error || result.error);
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

