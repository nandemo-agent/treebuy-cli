'use strict';

/**
 * 清洗使用者輸入字串：移除控制字元、截斷過長輸入
 * @param {string} input
 * @param {number} maxLen
 * @returns {string}
 */
function sanitizeString(input, maxLen = 300) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // 控制字元
    .trim()
    .slice(0, maxLen);
}

module.exports = { sanitizeString };
