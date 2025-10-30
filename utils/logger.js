// /utils/logger.js
const fs = require('fs/promises');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logDir, 'purchases.txt');

/**
 * Gets a formatted timestamp string (e.g., YYYY-MM-DD HH:MM:SS ICT)
 * @returns {string}
 */
function getTimestamp() {
  const now = new Date();
  // ปรับเวลาเป็น +7 (ICT/เวลาไทย)
  const offset = 7 * 60 * 60 * 1000;
  const thaiDate = new Date(now.getTime() + offset);

  // ดึงค่าวันที่และเวลาจาก ISO string
  const isoString = thaiDate.toISOString();
  const datePart = isoString.substring(0, 10);
  const timePart = isoString.substring(11, 19);

  return `${datePart} ${timePart} (ICT)`;
}

/**
 * Logs a successful purchase to logs/purchases.txt
 * @param {import('discord.js').User} discordUser The Discord user who made the purchase
 * @param {string} inGameName The in-game name of the player
 * @param {number} amount The amount of the purchase
 */
async function logPurchase(discordUser, inGameName, amount) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] User: ${discordUser.tag} (ID: ${discordUser.id}) | Player: ${inGameName} | Amount: ${amount} บาท\n`;

  try {
    // 1. ตรวจสอบว่ามีโฟลเดอร์ 'logs' หรือยัง ถ้าไม่มีให้สร้าง
    await fs.mkdir(logDir, { recursive: true });

    // 2. เขียน Log ต่อท้ายไฟล์ (.txt)
    await fs.appendFile(logFile, logMessage, 'utf8');
    console.log(`(Logger) บันทึกการซื้อสำเร็จ: ${inGameName} - ${amount} บาท`);
  } catch (error) {
    console.error('❌ (Logger) เกิดข้อผิดพลาดในการบันทึก Log:', error);
  }
}

module.exports = {
  logPurchase,
};
