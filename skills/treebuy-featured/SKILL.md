---
name: treebuy-featured
description: "查詢小樹購（treebuy.com）目前的 Featured Campaign 商品清單。Use when: (1) 需要小樹購主打活動商品，(2) 查看當前 featured 或 topic campaign 有哪些商品，(3) 想知道活動 SKU、標題、期間。Triggers on: 小樹購 featured, 小樹購主打, treebuy featured, 小樹購活動商品, treebuy campaign。"
---

# treebuy-featured

用 `treebuy-cli featured list` 取得小樹購目前的 Featured Campaign。

## 安裝

```bash
# 透過 npx skills add 安裝此技能
npx skills add https://github.com/nandemo-agent/treebuy-cli --skill treebuy-featured

# 或直接使用固定版本的 CLI（建議）
npm install -g @nandemo-agent/treebuy-cli@0.1.0
# 或：npx @nandemo-agent/treebuy-cli@0.1.0 featured list
```

## 指令

```bash
# 全部 campaigns
treebuy-cli featured list

# 只看 featured 類型
treebuy-cli featured list --kind featured

# 只看 topic 類型
treebuy-cli featured list --kind topic

# Agent/pipe 用：NDJSON + 精簡欄位（--fields 作用於 products[] 層級）
# kind 是 campaign-level 欄位，不受 --fields 控制，會自動保留在 campaign 物件
treebuy-cli featured list --ndjson --fields sku,title

# JSON array
treebuy-cli featured list --json
```

## Response 欄位

| 欄位 | 說明 |
|------|------|
| `id` | campaign ID |
| `kind` | `featured` 或 `topic` |
| `started_at` / `ended_at` | 活動期間（ISO 8601） |
| `cta_button` | `{title, url}` 或 null |
| `products[].sku` | 商品 SKU |
| `products[].title` | 商品標題 |
| `products[].image_url` | 圖片 URL |

API：`GET https://v2api.treebuy.com/v2/campaign/featured_products/get`

詳細 schema 見 [references/api.md](references/api.md)。
