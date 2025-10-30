// /utils/database.js
const mysql = require('mysql2/promise');
const { DB_CONFIG } = require('../config');

// สร้าง Connection Pool
let pool;
try {
  pool = mysql.createPool(DB_CONFIG);
  console.log('✅ (Database) เชื่อมต่อ Connection Pool สำเร็จ');
} catch (error) {
  console.error('❌ (Database) ไม่สามารถสร้าง Connection Pool:', error);
  process.exit(1);
}

/**
 * ดึงชื่อในเกมจาก Discord ID
 * @param {string} discordId ไอดี Discord ของผู้ใช้
 * @returns {Promise<string|null>} ชื่อในเกม หรือ null ถ้าไม่พบ
 */
async function getInGameName(discordId) {
  // ------------------------------------------------------------------
  // ‼️ --- อัปเดตตามโครงสร้าง DB ที่ยืนยันแล้ว --- ‼️
  //
  // ตาราง: 'hyperserverabiplayers', คอลัมน์ไอดีดิสคอร์ด 'discord_id', คอลัมน์ชื่อในเกม 'name'
  //
  const SQL = 'SELECT name FROM hyperserverabiplayers WHERE discord_id = ?'; // <--- ถูกต้อง
  //
  // ------------------------------------------------------------------

  try {
    const [rows] = await pool.query(SQL, [discordId]);

    if (rows && rows.length > 0) {
      // ‼️ --- อัปเดตตามโครงสร้าง DB ที่ยืนยันแล้ว --- ‼️
      return rows[0].name; // <--- ถูกต้อง
    } else {
      // ไม่พบผู้ใช้
      return null;
    }
  } catch (error) {
    console.error(`❌ (Database) เกิดข้อผิดพลาดขณะค้นหา ID ${discordId}:`, error);
    return null;
  }
}

/**
 * ตรวจสอบการเชื่อมต่อฐานข้อมูล
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function checkDbConnection() {
  try {
    // ลองดึง connection มา 1 อัน แล้วคืนกลับ pool
    const connection = await pool.getConnection();
    // ลอง query ง่ายๆ
    await connection.query('SELECT 1');
    connection.release();
    return { success: true, message: '✅ (Database) เชื่อมต่อสำเร็จ!' };
  } catch (error) {
    console.error('❌ (Database) ตรวจสอบการเชื่อมต่อล้มเหลว:', error.message);
    return { success: false, message: `❌ (Database) เชื่อมต่อล้มเหลว: ${error.message}` };
  }
}

async function getAllPlayers() {
  // ‼️ --- อัปเดตตามโครงสร้าง DB ที่ยืนยันแล้ว --- ‼️
  const SQL = 'SELECT * FROM hyperserverabiplayers'; // <--- ถูกต้อง

  try {
    const [rows] = await pool.query(SQL);
    return { success: true, data: rows };
  } catch (error) {
    console.error('❌ (Database) เกิดข้อผิดพลาดขณะดึงผู้เล่นทั้งหมด:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getInGameName,
  checkDbConnection,
  getAllPlayers,
};