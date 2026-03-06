---
name: treebuy-cli
description: 小樹購 CLI（treebuy-cli）操作工具。用於查詢 treebuy.com 商品資訊，包含 Featured Campaign 和關鍵字搜尋。Use when: (1) 查詢小樹購目前的 Featured Campaign 商品，(2) 依關鍵字搜尋小樹購商品，(3) 需要商品 SKU、名稱、售價、庫存等結構化資訊，(4) 需要 pipe 商品資料到其他工具。Triggers on: "找小樹購商品", "搜尋小樹購", "小樹購 featured", "treebuy 搜尋", "查小樹購庫存"。
---

# treebuy-cli — 小樹購 CLI

## 安裝

```bash
# Clone repo
git clone https://github.com/nandemo-agent/treebuy-cli.git
cd treebuy-cli
npm install

# 或全域安裝（開發中）
npm install -g .
```

## 核心指令

### Featured Campaign

```bash
# 列出所有 featured campaigns
treebuy-cli featured list

# 只看 featured 類型
treebuy-cli featured list --kind featured

# 只看 topic 類型
treebuy-cli featured list --kind topic

# Agent 友好：NDJSON 每筆一行
treebuy-cli featured list --ndjson

# 縮減欄位（節省 context）
treebuy-cli featured list --fields sku,title
```

### 搜尋商品

```bash
# 基本搜尋
treebuy-cli search products "Dyson"

# 指定排序
treebuy-cli search products "Dyson" --sort-by price_asc

# 分頁
treebuy-cli search products "Dyson" --page 2 --limit 10

# Agent 友好：NDJSON + 精簡欄位
treebuy-cli search products "Dyson" --ndjson --fields id,name,selling_price,in_stock

# JSON array（含 pagination）
treebuy-cli search products "Dyson" --json
```

## Agent 使用規範

> 詳細說明見 [references/agent-guide.md](references/agent-guide.md)

- **預設非 TTY 輸出 NDJSON**，pipe 直接可用
- **一定要加 `--fields`** 限制回傳欄位，避免浪費 context window
- 錯誤訊息在 **stderr**，stdout 只有結構化資料
- 需要商品完整資訊時，先搜尋取 `id`（SKU），再用 `v3/buyer/product/list` API 補齊

## API 端點（不變量）

| 功能 | 端點 |
|------|------|
| Featured | `GET https://v2api.treebuy.com/v2/campaign/featured_products/get` |
| 搜尋 | `GET https://v2api.treebuy.com/v2/product/search?query=...` |
| 商品詳情 | `GET https://v2api.treebuy.com/v3/buyer/product/list?product_ids=...` |

## 參考文件

- [references/agent-guide.md](references/agent-guide.md) — agent 使用模式、常見 workflow
- [references/api.md](references/api.md) — API response schema 說明
