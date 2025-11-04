const axios = require('axios');
const { SLIPOK_CONFIG } = require('../config');

async function verifySlipFromImage(imageUrl, amount = null) {
  try {
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    const base64Image = Buffer.from(imageResponse.data, 'binary').toString(
      'base64'
    );

    const body = { files: base64Image, log: true };
    if (amount) {
      body.amount = amount;
    } else if (SLIPOK_CONFIG.expectedAmount) {
      body.amount = SLIPOK_CONFIG.expectedAmount;
    }

    const response = await axios.post(
      `${SLIPOK_CONFIG.apiUrl}/${SLIPOK_CONFIG.branchId}`,
      body,
      {
        headers: {
          'x-authorization': SLIPOK_CONFIG.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
}

async function verifySlipFromQR(qrString, amount = null) {
  try {
    const body = { data: qrString, log: true };
    if (amount) {
      body.amount = amount;
    } else if (SLIPOK_CONFIG.expectedAmount) {
      body.amount = SLIPOK_CONFIG.expectedAmount;
    }

    const response = await axios.post(
      `${SLIPOK_CONFIG.apiUrl}/${SLIPOK_CONFIG.branchId}`,
      body,
      {
        headers: {
          'x-authorization': SLIPOK_CONFIG.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    return handleError(error);
  }
}

async function checkQuota() {
  try {
    const response = await axios.get(
      `${SLIPOK_CONFIG.apiUrl}/${SLIPOK_CONFIG.branchId}/quota`,
      {
        headers: {
          'x-authorization': SLIPOK_CONFIG.apiKey,
        },
      }
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('[System]Error checking quota:', error);
    return { success: false, error: handleError(error) };
  }
}

function handleError(error) {
  if (axios.isAxiosError(error) && error.response) {
    return {
      success: false,
      error: {
        code: error.response.data.code,
        message: error.response.data.message,
        data: error.response.data.data,
      },
    };
  }
  return {
    success: false,
    error: {
      code: 'UNKNOWN',
      message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
    },
  };
}

module.exports = {
  verifySlipFromImage,
  verifySlipFromQR,
  checkQuota,
};
