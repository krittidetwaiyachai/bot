const mysql = require('mysql2/promise');
const { DB_CONFIG } = require('../config');

let pool;
try {
  pool = mysql.createPool(DB_CONFIG);
  console.log('[System] เชื่อมต่อ Connection Pool สำเร็จ');
} catch (error) {
  console.error('❌ (Database) ไม่สามารถสร้าง Connection Pool:', error);
  process.exit(1);
}

async function getInGameName(discordId) {
  const SQL = 'SELECT name FROM hyperserverabiplayers WHERE discord_id = ?';

  try {
    const [rows] = await pool.query(SQL, [discordId]);

    if (rows && rows.length > 0) {
      return rows[0].name;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`[System] เกิดข้อผิดพลาดขณะค้นหา ID ${discordId}:`, error);
    return null;
  }
}

async function checkDbConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return { success: true, message: '✅ (Database) เชื่อมต่อสำเร็จ!' };
  } catch (error) {
    console.error('[System] ตรวจสอบการเชื่อมต่อล้มเหลว:', error.message);
    return { success: false, message: `❌ (Database) เชื่อมต่อล้มเหลว: ${error.message}` };
  }
}

async function getAllPlayers() {
  const SQL = 'SELECT * FROM hyperserverabiplayers';

  try {
    const [rows] = await pool.query(SQL);
    return { success: true, data: rows };
  } catch (error) {
    console.error('[System] เกิดข้อผิดพลาดขณะดึงผู้เล่นทั้งหมด:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getInGameName,
  checkDbConnection,
  getAllPlayers,
};
