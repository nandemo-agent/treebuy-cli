'use strict';

const { searchProducts } = require('../api/treebuy');

const VALID_SORT = ['rank', 'price_asc', 'price_desc', 'new'];

module.exports = function registerSearch(program) {
  const search = program
    .command('search')
    .description('搜尋商品');

  search
    .command('products')
    .description('依關鍵字搜尋商品')
    .argument('<query>', '搜尋關鍵字')
    .option('--page <n>', '頁碼（預設 1）', (v) => Number(v), 1)
    .option('--limit <n>', '每頁筆數（預設 20，最大 50）', (v) => Number(v), 20)
    .option('--sort-by <sort>', `排序：${VALID_SORT.join(' | ')}（預設 rank）`, 'rank')
    .option('--json', '輸出 JSON array')
    .option('--ndjson', '輸出 NDJSON（每筆一行，agent/pipe 友好）')
    .option('--fields <fields>', '指定輸出欄位，逗號分隔（例如 id,name,selling_price）')
    .option('--timeout <ms>', 'API timeout（毫秒，預設 10000）', (v) => Number(v), 10000)
    .action(async (query, opts) => {
      // 輸入驗證
      if (!VALID_SORT.includes(opts.sortBy)) {
        throw new Error(`--sort-by 必須是 ${VALID_SORT.join(', ')}`);
      }
      const limit = Math.min(Math.max(opts.limit, 1), 50);

      const data = await searchProducts(query, {
        page: opts.page,
        limit,
        sortBy: opts.sortBy,
        timeoutMs: opts.timeout,
      });

      const fields = opts.fields ? opts.fields.split(',').map(f => f.trim()) : null;

      // --fields 遮罩
      const hits = (data.hits || []).map(item => {
        if (!fields) return item;
        const obj = {};
        for (const f of fields) if (item[f] !== undefined) obj[f] = item[f];
        return obj;
      });

      // pagination summary
      const pagination = data.pagination || {};

      if (opts.ndjson || (!opts.json && !process.stdout.isTTY)) {
        for (const item of hits) {
          process.stdout.write(JSON.stringify(item) + '\n');
        }
      } else if (opts.json) {
        process.stdout.write(JSON.stringify({ hits, pagination }, null, 2) + '\n');
      } else {
        // Human-readable
        const total = pagination.total_count || hits.length;
        const page = pagination.page || opts.page;
        const totalPage = pagination.total_page || '-';
        console.log(`\n搜尋「${query}」— 共 ${total} 筆（第 ${page}/${totalPage} 頁）\n`);
        for (const item of hits) {
          if (fields) {
            console.log(`  ${JSON.stringify(item)}`);
          } else {
            const price = item.promoted_price || item.selling_price;
            const market = item.market_price;
            const priceStr = market && market !== price
              ? `$ ${market.toLocaleString()} → $ ${(price || '?').toLocaleString()}`
              : `$ ${(price || '?').toLocaleString()}`;
            const stock = item.in_stock ? '' : ' [缺貨]';
            console.log(`  [${item.id}] ${item.name}${stock}`);
            console.log(`         品牌: ${item.brand_show || '-'}  ${priceStr}`);
          }
        }
        if (hits.length === 0) {
          console.log('  （無結果）');
        }
      }
    });
};
