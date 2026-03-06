'use strict';

const BASE_URL = 'https://v2api.treebuy.com';
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * GET /v2/campaign/featured_products/get
 * @param {{timeoutMs?: number}} [options]
 * @returns {Promise<{featured: Array, topic: Array}>}
 */
async function getFeaturedProducts(options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS;
  const url = `${BASE_URL}/v2/campaign/featured_products/get`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw new Error(`API timeout after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET /v2/product/search
 * @param {string} query  搜尋關鍵字
 * @param {{page?: number, limit?: number, sortBy?: string, timeoutMs?: number}} [options]
 * @returns {Promise<{hits: Array, pagination: object, facets: object}>}
 */
async function searchProducts(query, options = {}) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('query 不能為空');
  }
  // 輸入防禦：拒絕控制字元、path traversal
  if (/[\x00-\x1f\x7f]/.test(query)) {
    throw new Error('query 包含非法字元');
  }

  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS;
  const page = Number.isFinite(options.page) ? options.page : 1;
  const limit = Number.isFinite(options.limit) ? options.limit : 20;
  const sortBy = options.sortBy || 'rank';

  const params = new URLSearchParams({
    query: query.trim(),
    page: String(page),
    limit: String(limit),
    sort_by: sortBy,
  });
  const url = `${BASE_URL}/v2/product/search?${params}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw new Error(`API timeout after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { getFeaturedProducts, searchProducts };
