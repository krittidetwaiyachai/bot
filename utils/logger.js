const fs = require('fs/promises');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'purchases.txt');

function getTimestamp() {
  const now = new Date();
  const offset = 7 * 60 * 60 * 1000;
  const thaiDate = new Date(now.getTime() + offset);

  const isoString = thaiDate.toISOString();
  const datePart = isoString.substring(0, 10);
  const timePart = isoString.substring(11, 19);

  return `${datePart} ${timePart} (ICT)`;
}

async function logPurchase(discordUser, inGameName, bahtAmount, pointAmount) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] User: ${
    discordUser.tag
  } (ID: ${
    discordUser.id
  }) | Player: ${inGameName} | Amount: ${bahtAmount} บาท (-> ${pointAmount.toLocaleString()} พ้อย)\n`;

  try {
    await fs.mkdir(logDir, { recursive: true });

    await fs.appendFile(logFile, logMessage, 'utf8');
    console.log(
      `[System] Logger บันทึกการซื้อสำเร็จ: ${inGameName} - ${bahtAmount} บาท -> ${pointAmount} พ้อย`
    );
  } catch (error) {
    console.error('[System] Logger เกิดข้อผิดพลาดในการบันทึก Log:', error);
  }
}

module.exports = {
  logPurchase,
};

