'use strict';

const { getFeaturedProducts } = require('../api/treebuy');

module.exports = function registerFeatured(program) {
  const featured = program
    .command('featured')
    .description('Featured Campaign 相關指令');

  featured
    .command('list')
    .description('列出目前的 Featured Campaign 及商品')
    .option('--kind <kind>', '篩選類型：featured | topic（預設全部）')
    .option('--json', '以 JSON 格式輸出')
    .option('--fields <fields>', '指定輸出欄位，逗號分隔（例如 sku,title）')
    .action(async (opts) => {
      let data;
      try {
        data = await getFeaturedProducts();
      } catch (err) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }

      // 合併並加上 kind 欄位
      let campaigns = [
        ...data.featured.map(c => ({ ...c, kind: 'featured' })),
        ...data.topic.map(c => ({ ...c, kind: 'topic' })),
      ];

      // --kind 篩選
      if (opts.kind) {
        const allowed = ['featured', 'topic'];
        if (!allowed.includes(opts.kind)) {
          process.stderr.write(`Error: --kind 必須是 featured 或 topic\n`);
          process.exit(1);
        }
        campaigns = campaigns.filter(c => c.kind === opts.kind);
      }

      // --fields 欄位遮罩（套用在 products 上）
      const fields = opts.fields ? opts.fields.split(',').map(f => f.trim()) : null;

      const output = campaigns.map(c => ({
        id: c.id,
        kind: c.kind,
        started_at: c.started_at,
        ended_at: c.ended_at,
        cta_button: c.cta_button || null,
        products: (c.products || []).map(p => {
          if (!fields) return p;
          const obj = {};
          for (const f of fields) if (p[f] !== undefined) obj[f] = p[f];
          return obj;
        }),
      }));

      if (opts.json || !process.stdout.isTTY) {
        // Non-TTY / --json：NDJSON，每個 campaign 一行
        for (const item of output) {
          process.stdout.write(JSON.stringify(item) + '\n');
        }
      } else {
        // Human-readable
        for (const c of output) {
          console.log(`\n[${c.kind.toUpperCase()}] ${c.id}`);
          console.log(`  期間：${c.started_at} → ${c.ended_at}`);
          if (c.cta_button) {
            console.log(`  CTA：${c.cta_button.title}  ${c.cta_button.url}`);
          }
          console.log(`  商品（${c.products.length} 件）：`);
          for (const p of c.products) {
            if (fields) {
              console.log(`    ${JSON.stringify(p)}`);
            } else {
              console.log(`    [${p.sku}] ${p.title}`);
            }
          }
        }
      }
    });
};
