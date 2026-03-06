'use strict';

const SCHEMAS = {
  'featured list': {
    command: 'featured list',
    description: '列出 Featured Campaign 商品清單',
    api: 'GET https://v2api.treebuy.com/v2/campaign/featured_products/get',
    arguments: [],
    options: [
      { name: '--kind', type: 'enum', values: ['featured', 'topic'], description: '篩選 campaign 類型' },
      { name: '--json', type: 'boolean', description: '輸出 JSON array' },
      { name: '--ndjson', type: 'boolean', description: '輸出 NDJSON（非 TTY 預設）' },
      { name: '--fields', type: 'string', description: '指定 products[] 欄位（逗號分隔）。注意：kind 是 campaign-level，不受此旗標影響' },
      { name: '--timeout', type: 'number', default: 10000, description: 'API timeout（毫秒）' },
    ],
    output_fields: {
      'campaign': ['id', 'kind', 'started_at', 'ended_at', 'cta_button'],
      'campaign.products[]': ['sku', 'var_id', 'title', 'image_url', 'cta_open_in_new_window'],
    },
  },
  'search products': {
    command: 'search products',
    description: '依關鍵字搜尋商品',
    api: 'GET https://v2api.treebuy.com/v2/product/search?query=...&page=&limit=&sort_by=',
    arguments: [
      { name: 'query', type: 'string', required: true, description: '搜尋關鍵字' },
    ],
    options: [
      { name: '--page', type: 'number', default: 1, description: '頁碼（1-based）' },
      { name: '--limit', type: 'number', default: 20, max: 50, description: '每頁筆數（最大 50）' },
      { name: '--sort-by', type: 'enum', values: ['rank', 'price_asc', 'price_desc', 'new'], default: 'rank', description: '排序方式' },
      { name: '--json', type: 'boolean', description: '輸出 JSON（含 pagination）' },
      { name: '--ndjson', type: 'boolean', description: '輸出 NDJSON（非 TTY 預設）' },
      { name: '--fields', type: 'string', description: '指定 hits[] 欄位（逗號分隔）' },
      { name: '--timeout', type: 'number', default: 10000, description: 'API timeout（毫秒）' },
    ],
    output_fields: {
      'hits[]': [
        'id', 'name', 'brand_show', 'subtitle', 'special_title',
        'media_item', 'image_id', 'in_stock', 'is_adult', 'is_hidden',
        'is_launched', 'is_preview', 'has_multiple_price', 'has_potential_promotion',
        'market_price', 'selling_price', 'promoted_price', 'point',
        'override_price_var_id', 'categories', 'group_buy_rebate',
        'available_delivery_type', 'sales_type',
      ],
      'pagination': ['page', 'limit', 'total_page', 'total_count'],
    },
  },
};

const VALID_COMMANDS = Object.keys(SCHEMAS);

module.exports = function registerSchema(program) {
  program
    .command('schema [args...]')
    .description('查詢指令的 input/output schema（agent introspection 用）')
    .option('--output', '只顯示 output_fields')
    .option('--json', '強制 JSON 輸出')
    .allowUnknownOption(false)
    .action((args, opts) => {
      // schema（無 args）→ list all
      if (!args || args.length === 0) {
        const list = VALID_COMMANDS.map(cmd => ({
          command: cmd,
          description: SCHEMAS[cmd].description,
          api: SCHEMAS[cmd].api,
        }));
        if (opts.json || !process.stdout.isTTY) {
          process.stdout.write(JSON.stringify(list, null, 2) + '\n');
        } else {
          console.log('\n可查詢的指令 schema：\n');
          for (const item of list) {
            console.log(`  ${item.command.padEnd(22)} ${item.description}`);
          }
          console.log(`\n使用方式: treebuy-cli schema <command>\n  例如: treebuy-cli schema search products`);
        }
        return;
      }

      const key = args.join(' ');
      const s = SCHEMAS[key];
      if (!s) {
        process.stderr.write(
          `找不到 schema：「${key}」\n可用指令：${VALID_COMMANDS.join('  |  ')}\n`
        );
        process.exitCode = 1;
        return;
      }

      if (opts.output) {
        process.stdout.write(
          JSON.stringify({ command: s.command, output_fields: s.output_fields }, null, 2) + '\n'
        );
        return;
      }

      if (opts.json || !process.stdout.isTTY) {
        process.stdout.write(JSON.stringify(s, null, 2) + '\n');
        return;
      }

      // Human-readable
      console.log(`\nSchema: ${s.command}`);
      console.log(`描述:   ${s.description}`);
      console.log(`API:    ${s.api}\n`);

      if (s.arguments.length) {
        console.log('Arguments:');
        for (const a of s.arguments) {
          console.log(`  ${a.name.padEnd(12)} [${a.type}${a.required ? ', required' : ''}]  ${a.description}`);
        }
        console.log('');
      }

      console.log('Options:');
      for (const o of s.options) {
        const def = o.default !== undefined ? `  預設: ${o.default}` : '';
        const vals = o.values ? `  可選: ${o.values.join(' | ')}` : '';
        const max = o.max !== undefined ? `  max: ${o.max}` : '';
        console.log(`  ${o.name.padEnd(14)} [${o.type}]${def}${vals}${max}`);
        console.log(`                 ${o.description}`);
      }

      console.log('\nOutput fields:');
      for (const [scope, fields] of Object.entries(s.output_fields)) {
        console.log(`  ${scope}:`);
        console.log(`    ${fields.join(', ')}`);
      }
      console.log('');
    });
};
