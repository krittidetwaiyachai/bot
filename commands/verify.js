// /commands/verify.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // ‹--- (แก้ไข) Import EmbedBuilder
const { verifySlipFromImage } = require('../utils/slipok');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embeds');
const { getInGameName } = require('../utils/database');
const {
  RCON_CHANNEL_ID,
  POINT_RATE,
  ADMIN_LOG_CHANNEL_ID,
} = require('../config'); // ‹--- (แก้ไข) Import POINT_RATE และ ADMIN_LOG_CHANNEL_ID
const { logPurchase } = require('../utils/logger'); // <-- Import Logger

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

    // --- เช็กไฟล์ ---
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

    // --- ตอบกลับแบบลับ (ephemeral) เสมอ ---
    await interaction.deferReply({ ephemeral: true });

    // --- 1. ตรวจสอบสลิป ---
    const result = await verifySlipFromImage(attachment.url, null);

    // --- 2. ถ้าสลิปผ่าน (Success) ---
    if (result.success) {
      const slipData = result.data;
      const discordId = interaction.user.id;
      const amount = slipData.amount; // ดึงยอดเงินจากสลิป

      // สร้าง Embed พื้นฐาน
      const embed = createSuccessEmbed(slipData);

      // --- 3. ค้นหาชื่อในเกมจาก DB ---
      const inGameName = await getInGameName(discordId);

      if (!inGameName) {
        // --- 3.1 ไม่พบชื่อใน DB ---
        embed.addFields({
          name: '⚠️ สถานะการเติมเงิน',
          value:
            'สลิปถูกต้อง แต่ไม่พบชื่อของคุณในฐานข้อมูล! กรุณาติดต่อแอดมินเพื่อเชื่อมต่อบัญชี',
        });
      } else if (!amount || amount <= 0) {
        // --- 3.2 สลิปไม่มียอดเงิน (หรืออ่านไม่ได้) ---
        embed.addFields({
          name: '⚠️ สถานะการเติมเงิน',
          value: `สลิปถูกต้อง แต่ไม่สามารถอ่านยอดเงินได้ (ยอด ${amount} บาท)`,
        });
      } else {
        // --- 3.3 พบชื่อ และ มียอดเงิน -> ส่ง RCON ---
        try {
          const rconChannel = await interaction.client.channels.fetch(
            RCON_CHANNEL_ID
          );

          if (!rconChannel || !rconChannel.isTextBased()) {
            throw new Error('ไม่พบช่อง RCON หรือช่องนั้นไม่ใช่ Text Channel');
          }

          // --- (แก้ไข) คำนวณ Point ---
          const bahtAmount = Math.floor(amount);
          const calculatedPoints = bahtAmount * POINT_RATE; // ‹--- คำนวณ (เช่น 10 * 100 = 1000)

          // สร้างคำสั่ง RCON (ใช้ calculatedPoints)
          const rconCommand = `!rcon coinsengine:point give ${inGameName} ${calculatedPoints}`;

          // ส่งเข้าช่อง RCON
          await rconChannel.send(rconCommand);

          // (แก้ไข) แจ้งผู้ใช้ว่าสำเร็จ (ใช้ calculatedPoints)
          embed.addFields({
            name: '💸 สถานะการเติมเงิน',
            value: `✅ ระบบได้ทำการเติมพ้อยให้ \`${inGameName}\` จำนวน \`${calculatedPoints.toLocaleString()}\` พ้อย เรียบร้อย!`,
          });

          // --- (แก้ไข) บันทึก Log การซื้อ (ส่งค่า cả baht และ points) ---
          try {
            await logPurchase(
              interaction.user,
              inGameName,
              bahtAmount,
              calculatedPoints
            );
          } catch (logError) {
            // หาก Log พัง ก็ไม่เป็นไร อย่าให้กระทบผู้ใช้งาน
            console.error(
              '❌ (Logger) บันทึก Log ล้มเหลว (แต่การเติมเงินสำเร็จ):',
              logError
            );
          }
          // --- สิ้นสุดการบันทึก Log ---

          // --- (เพิ่มใหม่) ส่ง Log Embed ไปยังห้อง Admin ---
          if (ADMIN_LOG_CHANNEL_ID) {
            try {
              const adminLogChannel = await interaction.client.channels.fetch(
                ADMIN_LOG_CHANNEL_ID
              );
              if (adminLogChannel && adminLogChannel.isTextBased()) {
                const adminEmbed = new EmbedBuilder()
                  .setColor(0x57f287) // สีเขียว
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
                '❌ (Admin Log) ส่ง Embed ไปห้องแอดมินล้มเหลว:',
                adminLogError
              );
            }
          }
          // --- สิ้นสุดการส่ง Log Admin ---
        } catch (error) {
          console.error('❌ (RCON) ส่งคำสั่งล้มเหลว:', error);
          embed.addFields({
            name: '🔥 สถานะการเติมเงิน',
            value: `สลิปถูกต้อง แต่การเติมพ้อยให้ \`${inGameName}\` ล้มเหลว กรุณาติดต่อแอดมินโดยด่วน!`,
          });
        }
      }

      // --- 4. ตอบกลับผู้ใช้ (แบบลับ) ---
      await interaction.editReply({ embeds: [embed] });
    } else {
      // --- 5. ถ้าสลิปล้มเหลว (Error) ---
      const embed = createErrorEmbed(result.error.error || result.error);
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

