// /utils/embeds.js
const { EmbedBuilder } = require('discord.js');
const { formatDate } = require('./formatters');
const { BANK_NAMES, BOT_CONFIG } = require('../config');

/**
 * สร้าง Embed สำหรับสลิปที่ถูกต้อง (Success)
 * อ่าน Config จาก BOT_CONFIG.embeds.success
 */
function createSuccessEmbed(slipData) {
  const cfg = BOT_CONFIG.embeds.success; // ดึง Config มา
  const fields = []; // สร้าง list ว่างๆ

  // 1. คำนวณค่า
  const sendingBank = BANK_NAMES[slipData.sendingBank] || slipData.sendingBank || '-';
  const receivingBank = BANK_NAMES[slipData.receivingBank] || slipData.receivingBank || '-';
  const amount =
    typeof slipData.amount === 'number'
      ? slipData.amount.toLocaleString()
      : String(slipData.amount || '-');

  // 2. เช็ก Config แล้วยัดใส่ list
  if (cfg.fields.showAmount) {
    fields.push({ name: cfg.fields.amountName, value: `${amount} บาท`, inline: true });
  }
  if (cfg.fields.showDate) {
    fields.push({
      name: cfg.fields.dateName,
      value: formatDate(slipData.transDate),
      inline: true,
    });
  }
  if (cfg.fields.showTime) {
    fields.push({ name: cfg.fields.timeName, value: slipData.transTime || '-', inline: true });
  }
  if (cfg.fields.showSenderBank) {
    fields.push({ name: cfg.fields.senderBankName, value: sendingBank, inline: true });
  }
  if (cfg.fields.showReceiverBank) {
    fields.push({ name: cfg.fields.receiverBankName, value: receivingBank, inline: true });
  }
  if (cfg.fields.showRef) {
    fields.push({ name: cfg.fields.refName, value: slipData.transRef || '-', inline: true });
  }

  // 3. สร้าง Embed
  return new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(cfg.title)
    .setDescription(cfg.description)
    .addFields(fields) // เพิ่ม fields ทั้งหมดทีเดียว
    .setFooter({ text: cfg.footer })
    .setTimestamp();
}

/**
 * สร้าง Embed สำหรับข้อผิดพลาด (Error)
 * อ่าน Config จาก BOT_CONFIG.embeds.error
 */
function createErrorEmbed(error) {
  const cfg = BOT_CONFIG.embeds.error; // ดึง Config มา
  const fields = [];

  if (cfg.fields.showErrorCode) {
    fields.push({
      name: cfg.fields.errorCodeName,
      value: `${error.code || 'UNKNOWN'}`,
      inline: true,
    });
  }

  return new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(cfg.title)
    .setDescription(error.message || 'ไม่สามารถตรวจสอบสลิปได้')
    .addFields(fields)
    .setFooter({ text: cfg.footer })
    .setTimestamp();
}

/**
 * สร้าง Embed แนะนำการใช้งาน (Help Panel)
 * อ่าน Config จาก BOT_CONFIG.embeds.help
 */
function createHelpEmbed(client) {
  const cfg = BOT_CONFIG.embeds.help; // ดึง Config มา
  const fields = [];

  if (cfg.fields.showVerifyCommand) {
    fields.push({
      name: cfg.fields.verifyCommandName,
      value: cfg.fields.verifyCommandValue,
    });
  }
  if (cfg.fields.showStatus) {
    fields.push({
      name: cfg.fields.statusName,
      value: cfg.fields.statusValue,
      inline: true,
    });
  }
  if (cfg.fields.showVersion) {
    fields.push({
      name: cfg.fields.versionName,
      value: BOT_CONFIG.botVersion, // ดึงจาก Config หลัก
      inline: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(cfg.title)
    .setDescription(cfg.description)
    .addFields(fields)
    .setFooter({ text: cfg.footer })
    .setTimestamp();

  if (cfg.thumbnail) {
    embed.setThumbnail(client.user.displayAvatarURL());
  }

  return embed;
}

module.exports = {
  createSuccessEmbed,
  createErrorEmbed,
  createHelpEmbed,
};