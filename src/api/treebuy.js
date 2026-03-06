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

module.exports = { getFeaturedProducts };
