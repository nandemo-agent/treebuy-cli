'use strict';

// ──────────────────────────────────────────────────────────────
// 規則式 keyword expansion
// 依照 description 中出現的關鍵詞，展開多組搜尋關鍵字
// 類別盡量不重疊，確保推薦多樣性
// ──────────────────────────────────────────────────────────────

// 對象 → 適合的禮物分類 keyword 組合
const RECIPIENT_KEYWORDS = {
  媽媽: ['保養品', '香氛蠟燭', '絲巾', '茶葉禮盒', '按摩器'],
  母親: ['保養品', '香氛蠟燭', '絲巾', '茶葉禮盒', '按摩器'],
  爸爸: ['咖啡豆', '皮夾', '保溫杯', '保健食品', '電動刮鬍刀'],
  父親: ['咖啡豆', '皮夾', '保溫杯', '保健食品', '電動刮鬍刀'],
  男友: ['潮流帽T', '咖啡', '皮夾', '運動水壺', '香水'],
  女友: ['香水', '保養', '耳環', '香氛', '絲巾'],
  老婆: ['保養品', '香水', '珠寶', '香氛蠟燭', '絲巾'],
  老公: ['咖啡', '皮夾', '手錶', '保溫杯', '電子產品'],
  同事: ['馬克杯', '茶葉', '零食禮盒', '文具', '手帕'],
  朋友: ['零食禮盒', '香氛', '帆布包', '馬克杯', '文具'],
  小孩: ['玩具', '繪本', '文具', '糖果', '帆布包'],
  長輩: ['保健食品', '茶葉禮盒', '保溫杯', '暖暖包', '養生食品'],
  老師: ['茶葉', '馬克杯', '文具', '香氛蠟燭', '書籤'],
};

// 場合 → 額外補充 keywords
const OCCASION_KEYWORDS = {
  母親節: ['限定禮盒', '花束', '保養禮盒'],
  父親節: ['限定禮盒', '威士忌杯', '咖啡禮盒'],
  生日: ['蛋糕', '禮盒', '祝賀'],
  聖誕節: ['聖誕禮盒', '交換禮物', '限定版'],
  婚禮: ['喜糖', '伴手禮', '婚禮小物'],
  情人節: ['玫瑰', '巧克力', '情侶'],
  過年: ['年節禮盒', '乾貨', '伴手禮'],
};

// 通用 fallback（無法解析 recipient 時）
const FALLBACK_KEYWORDS = ['禮盒', '保養品', '香氛', '茶葉', '咖啡', '零食'];

/**
 * 從 description 中解析出 recipient、occasion、budget
 * @param {string} description
 * @returns {{ recipient: string|null, occasion: string|null, budget: number|null }}
 */
function parseDescription(description) {
  const recipientKeys = Object.keys(RECIPIENT_KEYWORDS);
  const occasionKeys = Object.keys(OCCASION_KEYWORDS);

  const recipient = recipientKeys.find(k => description.includes(k)) || null;
  const occasion = occasionKeys.find(k => description.includes(k)) || null;

  // 解析預算，優先順序：每份 > 預算 > 一般金額（元/塊）
  // 避免誤抓數量（「需要 10 份」）
  let budget = null;
  const perUnitMatch = description.match(/每[份件個]\s*(\d+)\s*(?:元|塊|以內|以下|左右)?/);
  const budgetMatch = description.match(/預算\s*(?:NT\$|NTD|￥)?\s*(\d+)/);
  const amountMatch = description.match(/(?:NT\$|NTD|￥)\s*(\d+)|(\d+)\s*(?:元|塊)(?:以內|以下|左右)?/);

  if (perUnitMatch) budget = parseInt(perUnitMatch[1], 10);
  else if (budgetMatch) budget = parseInt(budgetMatch[1], 10);
  else if (amountMatch) budget = parseInt(amountMatch[1] || amountMatch[2], 10);

  return { recipient, occasion, budget };
}

/**
 * 根據解析結果展開搜尋關鍵字（去除重複，保留多樣性）
 * @param {object} parsed
 * @returns {string[]}
 */
function expandKeywords(parsed) {
  const { recipient, occasion } = parsed;
  const seen = new Set();
  const keywords = [];

  const add = (kw) => {
    if (!seen.has(kw)) { seen.add(kw); keywords.push(kw); }
  };

  if (recipient && RECIPIENT_KEYWORDS[recipient]) {
    RECIPIENT_KEYWORDS[recipient].forEach(add);
  }

  if (occasion && OCCASION_KEYWORDS[occasion]) {
    OCCASION_KEYWORDS[occasion].forEach(add);
  }

  if (keywords.length < 3) {
    FALLBACK_KEYWORDS.forEach(add);
  }

  return keywords.slice(0, 8); // 最多 8 組
}

module.exports = { parseDescription, expandKeywords, RECIPIENT_KEYWORDS, OCCASION_KEYWORDS };
