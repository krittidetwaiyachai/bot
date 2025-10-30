// config.js
require('dotenv').config();

// --- 1. โหลดจาก .env (ค่าความลับ) ---
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const PANEL_CHANNEL_ID = process.env.PANEL_CHANNEL_ID;
const RCON_CHANNEL_ID = process.env.RCON_CHANNEL_ID;
const EXPORT_CHANNEL_ID = process.env.EXPORT_CHANNEL_ID;
// --- 1.1 (เพิ่มใหม่) โหลด POINT_RATE ---
const POINT_RATE = process.env.POINT_RATE
  ? parseInt(process.env.POINT_RATE, 10)
  : 1; // ‹--- ถ้าไม่เจอใน .env ให้ใช้ 100 เป็นค่าเริ่มต้น

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const SLIPOK_CONFIG = {
  branchId: process.env.SLIPOK_BRANCH_ID,
  apiKey: process.env.SLIPOK_API_KEY,
  apiUrl: 'https://api.slipok.com/api/line/apikey',
  expectedAmount: process.env.SLIPOK_EXPECTED_AMOUNT
    ? Number(process.env.SLIPOK_EXPECTED_AMOUNT)
    : null,
};

// --- 2. 🌟 ศูนย์บัญชาการ Embeds (แก้ตรงนี้ได้เลย) 🌟 ---
const BOT_CONFIG = {
  botName: '🪙 Topup Verification Bot', // ‹--- คุณเปลี่ยนตรงนี้
  botVersion: '1.1.0',

  // --- 2.1 Embed หน้า Help / Panel ---
  embeds: {
    help: {
      color: 0xffd100,// สีหลัก (Blurple)
      title: '🪙 Topup Verification Bot', // ‹--- (แก้ไข) ผมเปลี่ยนตรงนี้ให้ตรงกัน
      description:
        'บอทสำหรับตรวจสอบสลิปเติมพ้อยอัตโนมัติ\n*(ผลลัพธ์การตรวจสอบทั้งหมดจะเห็นเฉพาะคุณเท่านั้น)*',
      footer: 'Powered by Bloom Blade Craft',
      thumbnail: true, // true = แสดงรูปโปรไฟล์บอท

      fields: {
        showVerifyCommand: true,
        verifyCommandName: '⚙️ คำสั่งหลัก: /`verify`',
        verifyCommandValue:
          'ใช้คำสั่งนี้แล้วแนบ **ไฟล์รูปสลิป** (.png, .jpg) ในช่อง `slip` บอทจะทำการตรวจสอบและเติมพ้อยให้คุณทันที\n\nธนาคาร กสิกรไทย\nเลขบัญชี 123-4-56789-0\nชื่อบัญชี นายสมชาย ใจดี\n\n**🚨 โปรดระวังบอทจะไม่มีการทักหาส่วนตัวเพื่อขอข้อมูลใดๆ** 🚨',

        // (ค่าเวอร์ชันจะดึงจาก botVersion ข้างบน)
      },
    },

    // --- 2.2 Embed ตอนสลิป "ถูกต้อง" (Success) ---
    success: {
      color: 0x57F287, // สีเขียว
      title: '✅ ตรวจสอบสำเร็จ',
      description: 'สลิปนี้ถูกต้องและได้รับการยืนยันแล้ว',
      footer: 'ผลลัพธ์นี้เห็นเฉพาะคุณ',

      fields: {
        showAmount: true,
        amountName: '💰 จำนวนเงิน',

        showDate: true,
        dateName: '📅 วันที่',

        showTime: true,
        timeName: '⏰ เวลา',

        showRef: true,
        refName: '📝 เลขอ้างอิง',
      },
    },

    // --- 2.3 Embed ตอน "ล้มเหลว" (Error) ---
    error: {
      color: 0xED4245, // สีแดง
      title: '❌ ตรวจสอบล้มเหลว',
      // (description จะเป็นข้อความ error จาก API)
      footer: 'ผลลัพธ์นี้เห็นเฉพาะคุณ',

      fields: {
        showErrorCode: true,
        errorCodeName: 'รหัสข้อผิดพลาด',
      },
    },
  },
};

// --- 3. ค่าคงที่ (ไม่ค่อยได้แก้) ---
const BANK_NAMES = {
  '002': 'ธนาคารกรุงเทพ',
  '004': 'ธนาคารกสิกรไทย',
  '006': 'ธนาคารกรุงไทย',
  '011': 'ธนาคารทหารไทยธนชาต',
  '014': 'ธนาคารไทยพาณิชย์',
  '025': 'ธนาคารกรุงศรีอยุธยา',
  '069': 'ธนาคารเกียรตินาคินภัทร',
  '022': 'ธนาคารซีไอเอ็มบีไทย',
  '067': 'ธนาคารทิสโก้',
  '024': 'ธนาคารยูโอบี',
  '030': 'ธนาคารออมสิน',
  '033': 'ธนาคารอาคารสงเคราะห์',
};

// --- 4. ตรวจสอบค่าที่จำเป็น ---
if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('❌ ไม่พบ DISCORD_TOKEN หรือ CLIENT_ID ใน .env');
  process.exit(1);
}
if (!SLIPOK_CONFIG.branchId || !SLIPOK_CONFIG.apiKey) {
  console.error('❌ ไม่พบ SLIPOK_BRANCH_ID หรือ SLIPOK_API_KEY ใน .env');
  process.exit(1);
}
if (!RCON_CHANNEL_ID) {
  console.warn('⚠️ ไม่ได้ตั้งค่า RCON_CHANNEL_ID ใน .env');
}
if (!DB_CONFIG.host || !DB_CONFIG.user || !DB_CONFIG.database) {
  console.error('❌ ไม่ได้ตั้งค่า DB_HOST, DB_USER, หรือ DB_NAME ใน .env');
  process.exit(1);
}
if (!EXPORT_CHANNEL_ID) {
  console.warn('⚠️ ไม่ได้ตั้งค่า EXPORT_CHANNEL_ID ใน .env (คำสั่ง /export-data จะใช้ไม่ได้)');
}

// --- 5. (เพิ่มใหม่) ตรวจสอบ POINT_RATE ---
if (!process.env.POINT_RATE) {
  console.warn(
    `⚠️ ไม่ได้ตั้งค่า POINT_RATE ใน .env, ใช้ค่าเริ่มต้น: ${POINT_RATE}`
  );
}

// --- 6. ส่งออก --- (ปรับลำดับเลขจาก 5 เป็น 6)
module.exports = {
  DISCORD_TOKEN,
  CLIENT_ID,
  PANEL_CHANNEL_ID,
  RCON_CHANNEL_ID,
  EXPORT_CHANNEL_ID,
  POINT_RATE, // ‹--- (เพิ่มใหม่) ส่งออก POINT_RATE
  DB_CONFIG,
  SLIPOK_CONFIG,
  BOT_CONFIG,
  BANK_NAMES,
};

