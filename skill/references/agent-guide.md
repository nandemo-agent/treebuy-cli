# Agent 使用指南 — treebuy-cli

## 輸出格式選擇

| 情境 | 建議旗標 |
|------|---------|
| pipe 到其他工具 | `--ndjson`（預設非 TTY 即 NDJSON） |
| 需要完整 JSON + pagination | `--json` |
| 人工閱讀 | 不加旗標（TTY 自動 human-readable） |
| 減少 context 用量 | `--fields id,name,selling_price` |

## 常用 Workflow

### 1. 找出目前主打商品的 SKU 清單

```bash
treebuy-cli featured list --kind featured --fields sku,title --ndjson
```

### 2. 搜尋商品並只取必要欄位

```bash
treebuy-cli search products "空氣清淨機" \
  --sort-by price_asc \
  --limit 10 \
  --fields id,name,selling_price,market_price,in_stock \
  --ndjson
```

### 3. 找最便宜的有貨商品

```bash
treebuy-cli search products "Dyson" \
  --sort-by price_asc \
  --limit 20 \
  --fields id,name,selling_price,in_stock \
  --ndjson \
  | node -e "
    const rl = require('readline').createInterface({input:process.stdin});
    const items = [];
    rl.on('line', l => { try { items.push(JSON.parse(l)); } catch{} });
    rl.on('close', () => {
      const inStock = items.filter(i => i.in_stock);
      console.log(JSON.stringify(inStock[0], null, 2));
    });
  "
```

### 4. 查詢多頁結果

```bash
for page in 1 2 3; do
  treebuy-cli search products "按摩" --page $page --limit 20 --ndjson --fields id,name,selling_price
done
```

## 回傳欄位速查

### `search products` hits 物件

| 欄位 | 說明 |
|------|------|
| `id` | 商品 SKU（例如 `S23081450047`） |
| `name` | 商品名稱 |
| `brand_show` | 品牌顯示名稱 |
| `selling_price` | 售價（NTD） |
| `market_price` | 市場定價 |
| `promoted_price` | 促銷價（若有） |
| `in_stock` | 是否有貨（boolean） |
| `categories` | 分類陣列 `[{id, name}]` |
| `available_delivery_type` | 配送方式 `["home_delivery" \| "convenience_store"]` |

### `featured list` campaign 物件

| 欄位 | 說明 |
|------|------|
| `id` | campaign ID |
| `kind` | `featured` 或 `topic` |
| `started_at` / `ended_at` | 活動期間（ISO 8601） |
| `cta_button` | `{title, url}` 或 null |
| `products[].sku` | 商品 SKU |
| `products[].title` | 商品標題 |

## 注意事項

- 搜尋 API 的 query 參數名是 `query`，不是 `q`
- `featured list` 回傳 featured + topic 兩種，用 `--kind` 篩選
- `selling_price` 是未登入的售價；登入後可能有更低的會員價（需 auth，目前 CLI 尚未支援）
- API 無需 auth token（公開 API）
