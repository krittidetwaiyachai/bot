const { EmbedBuilder } = require('discord.js');
const { formatDate } = require('./formatters');
const { BANK_NAMES, BOT_CONFIG } = require('../config');

function createSuccessEmbed(slipData) {
  const cfg = BOT_CONFIG.embeds.success;
  const fields = [];

  const sendingBank = BANK_NAMES[slipData.sendingBank] || slipData.sendingBank || '-';
  const receivingBank = BANK_NAMES[slipData.receivingBank] || slipData.receivingBank || '-';
  const amount =
    typeof slipData.amount === 'number'
      ? slipData.amount.toLocaleString()
      : String(slipData.amount || '-');

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

  return new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(cfg.title)
    .setDescription(cfg.description)
    .addFields(fields)
    .setFooter({ text: cfg.footer })
    .setTimestamp();
}

function createErrorEmbed(error) {
  const cfg = BOT_CONFIG.embeds.error;
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

function createHelpEmbed(client) {
  const cfg = BOT_CONFIG.embeds.help;
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
      value: BOT_CONFIG.botVersion,
      inline: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(cfg.color)
    .setTitle(BOT_CONFIG.botName)
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

