'use strict';

const BASE_URL = 'https://v2api.treebuy.com';

/**
 * GET /v2/campaign/featured_products/get
 * @returns {Promise<{featured: Array, topic: Array}>}
 */
async function getFeaturedProducts() {
  const url = `${BASE_URL}/v2/campaign/featured_products/get`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

module.exports = { getFeaturedProducts };
