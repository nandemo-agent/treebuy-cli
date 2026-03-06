'use strict';

const { searchProducts } = require('../api/treebuy');
const { parseDescription, expandKeywords } = require('../lib/keyword-expander');
const { sanitizeString } = require('../lib/sanitize');

/**
 * 驗證並正規化 --keywords 輸入
 * - split by comma, trim, remove empty, dedupe（保留原順序）
 * - 最多 10 組，每組 1–30 字，不含控制字元
 * @param {string} raw
 * @returns {string[]}
 * @throws {Error}
 */
function parseKeywordsFlag(raw) {
  const parts = raw.split(',')
    .map(k => k.trim().replace(/[\x00-\x1f\x7f]/g, ''))
    .filter(k => k.length > 0);

  // 去重（保留原順序）
  const seen = new Set();
  const deduped = parts.filter(k => {
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (deduped.length === 0) throw new Error('--keywords 不可為空');
  if (deduped.length > 10) throw new Error(`--keywords 最多 10 組，收到 ${deduped.length} 組`);

  for (const k of deduped) {
    if (k.length > 30) throw new Error(`--keywords 單組不可超過 30 字：「${k.slice(0, 35)}…」`);
  }

  return deduped;
}

/**
 * 從 categories 陣列取出第一層 category key（正規化）
 */
function normalizeCategoryKey(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return '__unknown__';
  const first = categories[0];
  if (typeof first === 'string') return first;
  if (first && first.id) return String(first.id);
  if (first && first.name) return String(first.name);
  return '__unknown__';
}

/**
 * 並行搜尋多組 keywords，合併結果
 */
async function searchAll(keywords, opts, debug) {
  const results = await Promise.allSettled(
    keywords.map(kw =>
      searchProducts(kw, { page: 1, limit: 5, sortBy: 'rank', timeoutMs: opts.timeout })
        .then(data => ({ kw, hits: data.hits || [] }))
    )
  );

  const merged = [];
  for (const result of results) {
    if (result.status === 'rejected') {
      if (debug) process.stderr.write(`[debug] keyword search failed: ${result.reason?.message}\n`);
      continue;
    }
    const { kw, hits } = result.value;
    if (debug) process.stderr.write(`[debug] keyword="${kw}" hits=${hits.length}\n`);
    for (const h of hits) {
      merged.push({ product: h, source_keyword: kw });
    }
  }
  return merged;
}

/**
 * 過濾 + 去重 + 排序
 */
function dedupeAndRank(items, budget, count, debug) {
  const dropped = [];
  const byCategory = new Map();

  for (const { product: p, source_keyword } of items) {
    const price = p.selling_price ?? p.promoted_price ?? p.market_price ?? Infinity;

    if (budget !== null && price > budget) {
      if (debug) dropped.push({ sku: p.id, reason: `price ${price} > budget ${budget}` });
      continue;
    }

    const catKey = normalizeCategoryKey(p.categories);
    if (!byCategory.has(catKey)) byCategory.set(catKey, []);
    byCategory.get(catKey).push({ product: p, source_keyword, price });
  }

  const candidates = [];
  for (const [catKey, group] of byCategory.entries()) {
    group.sort((a, b) => {
      if (budget !== null) {
        const da = Math.abs(a.price - budget);
        const db = Math.abs(b.price - budget);
        if (da !== db) return da - db;
      }
      return String(a.product.id).localeCompare(String(b.product.id));
    });
    const best = group[0];
    candidates.push({
      sku: best.product.id,
      name: best.product.name,
      selling_price: best.price,
      product_url: `https://www.treebuy.com/products/${best.product.id}`,
      source_keyword: best.source_keyword,
      category_key: catKey,
      in_stock: best.product.in_stock ?? null,
      brand: best.product.brand_show ?? null,
      image_url: best.product.media_item?.url ?? null,
    });
  }

  candidates.sort((a, b) => {
    if (a.selling_price !== b.selling_price) return a.selling_price - b.selling_price;
    return String(a.sku).localeCompare(String(b.sku));
  });

  return {
    recommendations: candidates.slice(0, count),
    dropped,
  };
}

module.exports = function registerBestPresent(program) {
  program
    .command('best-present <description>')
    .description('依一句話描述，找出類別多樣的合適禮物')
    .option('--keywords <keywords>', 'agent 直接傳入搜尋關鍵字（逗號分隔，bypass 規則式展開）')
    .option('--budget <number>', '單件預算上限（自動從描述解析，可覆蓋）', (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n <= 0) throw new Error('--budget 必須為正整數');
      return n;
    })
    .option('--count <number>', '推薦幾件（預設 5）', (v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 1 || n > 20) throw new Error('--count 須介於 1–20');
      return n;
    }, 5)
    .option('--json', '輸出完整 JSON')
    .option('--ndjson', '每筆 recommendation 一行 NDJSON')
    .option('--fields <fields>', '指定 recommendations[] 輸出欄位（逗號分隔）')
    .option('--debug', '顯示 keyword 命中數與過濾原因（輸出到 stderr）')
    .option('--timeout <ms>', 'API timeout（毫秒）', (v) => parseInt(v, 10), 10000)
    .action(async (description, opts) => {
      try {
        // 輸入清洗
        const cleanDesc = sanitizeString(description);
        if (!cleanDesc) {
          process.stderr.write('description 不可為空\n');
          process.exitCode = 1;
          return;
        }

        // --keywords 驗證（失敗直接 exit 1，不 silently fallback）
        let keywords;
        let planner;
        if (opts.keywords !== undefined) {
          keywords = parseKeywordsFlag(opts.keywords);
          planner = 'agent';
        } else {
          const parsed = parseDescription(cleanDesc);
          keywords = expandKeywords(parsed);
          planner = 'rules';
        }

        // --budget 覆蓋描述解析出的值（只在規則式模式下才解析描述）
        let budget = opts.budget !== undefined ? opts.budget : null;
        if (budget === null && planner === 'rules') {
          const parsed = parseDescription(cleanDesc);
          budget = parsed.budget;
        }

        if (opts.debug) {
          process.stderr.write(`[debug] planner=${planner} budget=${budget} keywords: ${keywords.join(', ')}\n`);
        }

        // 並行搜尋
        const merged = await searchAll(keywords, { timeout: opts.timeout }, opts.debug);

        // 去重 + 排序
        const { recommendations, dropped } = dedupeAndRank(merged, budget, opts.count, opts.debug);

        if (recommendations.length === 0) {
          process.stderr.write('找不到符合條件的商品，請調整描述或預算。\n');
          process.exitCode = 1;
          return;
        }

        // --fields 遮罩（只作用於 recommendations[]，不影響 meta）
        const fields = opts.fields ? opts.fields.split(',').map(f => f.trim()) : null;
        const masked = recommendations.map(r => {
          if (!fields) return r;
          const obj = {};
          for (const f of fields) if (r[f] !== undefined) obj[f] = r[f];
          return obj;
        });

        // 輸出
        if (opts.json) {
          const out = {
            input: { description: cleanDesc, budget: budget ?? null, count: opts.count },
            planner,
            keywords_used: keywords,
            recommendations: masked,
            dropped: opts.debug ? dropped : undefined,
          };
          process.stdout.write(JSON.stringify(out, null, 2) + '\n');
        } else if (opts.ndjson || !process.stdout.isTTY) {
          for (const r of masked) {
            process.stdout.write(JSON.stringify(r) + '\n');
          }
        } else {
          // Human-readable TTY
          console.log(`\n🎁 依據：「${cleanDesc}」\n`);
          if (budget) console.log(`   預算上限：NT$ ${budget}`);
          console.log(`   使用關鍵字：${keywords.join('、')}  [${planner}]\n`);
          console.log('─'.repeat(60));
          for (const [i, r] of masked.entries()) {
            console.log(`\n  ${i + 1}. ${r.name}`);
            if (r.selling_price !== undefined) console.log(`     售價：NT$ ${r.selling_price}`);
            if (r.brand) console.log(`     品牌：${r.brand}`);
            if (r.product_url) console.log(`     連結：${r.product_url}`);
            console.log(`     SKU：${r.sku}  關鍵字：${r.source_keyword}`);
          }
          console.log('\n' + '─'.repeat(60) + '\n');
        }
      } catch (err) {
        process.stderr.write(`錯誤：${err.message}\n`);
        process.exitCode = 1;
      }
    });
};
