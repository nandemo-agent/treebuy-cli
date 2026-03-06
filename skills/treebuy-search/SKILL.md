---
name: treebuy-search
description: 依關鍵字搜尋小樹購（treebuy.com）商品，取得 SKU、名稱、售價、庫存等結構化資訊。Use when: (1) 搜尋小樹購商品，(2) 查詢特定品牌或類型商品清單，(3) 比較商品售價，(4) 需要商品 SKU 做後續處理。Triggers on: "搜尋小樹購", "找小樹購商品", "treebuy 搜尋", "小樹購找", "查小樹購庫存", "treebuy search"。
---

# treebuy-search

用 `treebuy-cli search products` 依關鍵字搜尋小樹購商品。

## 安裝

```bash
git clone https://github.com/nandemo-agent/treebuy-cli.git
cd treebuy-cli && npm install
```

## 指令

```bash
# 基本搜尋
treebuy-cli search products "Dyson"

# 排序（rank / price_asc / price_desc / new）
treebuy-cli search products "Dyson" --sort-by price_asc

# 分頁
treebuy-cli search products "Dyson" --page 2 --limit 10

# Agent/pipe 用：NDJSON + 精簡欄位
treebuy-cli search products "Dyson" --ndjson --fields id,name,selling_price,in_stock

# JSON（含 pagination）
treebuy-cli search products "Dyson" --json
```

## 重要參數

| 旗標 | 說明 | 預設 |
|------|------|------|
| `--sort-by` | `rank` / `price_asc` / `price_desc` / `new` | `rank` |
| `--page` | 頁碼（1-based） | `1` |
| `--limit` | 每頁筆數（max 50） | `20` |
| `--fields` | 欄位遮罩（逗號分隔） | 全部 |

## 常用 Response 欄位

| 欄位 | 說明 |
|------|------|
| `id` | 商品 SKU |
| `name` | 商品名稱 |
| `brand_show` | 品牌 |
| `selling_price` | 售價（NTD） |
| `market_price` | 定價 |
| `promoted_price` | 促銷價（若有） |
| `in_stock` | 是否有貨 |

> ⚠️ API query 參數名是 `query`，不是 `q`。

API：`GET https://v2api.treebuy.com/v2/product/search?query=...`

詳細 schema 與 workflow 見 [references/api.md](references/api.md)。
