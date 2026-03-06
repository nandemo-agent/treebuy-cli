# treebuy-cli — 小樹購 CLI

命令列工具，用於存取 [treebuy.com](https://www.treebuy.com) 的 API。

## 安裝

```bash
npm install -g treebuy-cli
# 或直接 clone 使用
npm install
```

## 使用方式

```bash
# 列出所有 Featured Campaign
treebuy-cli featured list

# 只看 featured 類型
treebuy-cli featured list --kind featured

# 只看 topic 類型
treebuy-cli featured list --kind topic

# 輸出 JSON array
treebuy-cli featured list --json

# 輸出 NDJSON（每行一筆，agent / pipe 友好）
treebuy-cli featured list --ndjson

# 只取特定欄位（僅 products.*，減少 context 負擔）
treebuy-cli featured list --fields sku,title

# 自訂 API timeout（毫秒）
treebuy-cli featured list --timeout 8000

# 組合使用
treebuy-cli featured list --kind topic --ndjson --fields sku,title
```

## Agent 使用提示

- 預設 stdout 非 TTY 時自動輸出 NDJSON（可用 `--json` 強制 JSON array）
- 使用 `--fields` 減少回應大小，避免 context window 浪費（僅作用於 `products`）
- 錯誤訊息輸出至 stderr，不影響 stdout 解析
- 支援 `--timeout` 控制 API 超時
- API 端點：`https://v2api.treebuy.com`

## 指令結構

```
treebuy-cli
└── featured
    └── list [--kind featured|topic] [--json] [--fields <欄位>]
```
