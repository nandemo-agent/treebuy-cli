# CLAUDE.md — treebuy-cli

這是 **小樹購 CLI（treebuy-cli）** 的 agent 工作指南。進 repo 前先讀這份。

## 專案概述

- **名稱：** treebuy-cli / 小樹購 CLI
- **指令名：** `treebuy-cli`
- **語言：** Node.js（CommonJS）
- **目的：** 透過命令列存取 treebuy.com（小樹購）的 API

## 目錄結構

```
bin/treebuy-cli.js       # CLI 入口，用 commander parseAsync
src/
  api/treebuy.js         # 所有 API 呼叫集中在這裡
  commands/              # 每個子指令一個檔案
    featured.js          # featured list
    search.js            # search products
skills/                  # Agent skill 目錄（canonical，用 npx skills add 安裝）
  treebuy-featured/      # featured list skill
  treebuy-search/        # search products skill
package.json
```

> ⚠️ 只有 `skills/` 是正規 skill 目錄。不要建立 `skill/` 或其他平行結構。

## API 端點（不變量）

Base URL：`https://v2api.treebuy.com`

| 功能 | 方法 | 路徑 |
|------|------|------|
| Featured Campaign | GET | `/v2/campaign/featured_products/get` |
| 搜尋商品 | GET | `/v2/product/search?query=...&page=&limit=&sort_by=` |
| 商品清單（by SKU）| GET | `/v3/buyer/product/list?product_ids=...` |

**重要：** 搜尋 API 的參數是 `query`，不是 `q`。

## 新增指令的慣例

1. 在 `src/commands/<name>.js` 建立新指令
2. 在 `src/api/treebuy.js` 新增對應 API function
3. 在 `bin/treebuy-cli.js` 加上 `require('../src/commands/<name>')(program)`
4. 更新 `README.md`

## 輸出格式規則（agent DX 優先）

- `--ndjson`：每筆一行，適合 pipe / agent 消費（非 TTY 預設）
- `--json`：整包 JSON array / object
- `--fields`：欄位遮罩，減少 context 大小
- 錯誤一律輸出到 **stderr**，不污染 stdout
- 錯誤統一由 `parseAsync().catch()` 處理，指令內用 `throw` 即可

## API 輸入防禦

每個新 API function 必須：
- 拒絕空字串 / 純空白
- 拒絕控制字元（`/[\x00-\x1f\x7f]/`）
- 加上 `AbortController` timeout（預設 10000ms，可 `--timeout` 覆寫）
- enum 參數用 whitelist 驗證

## 禁止事項

- 不要用 `process.exit()` 在指令內部（throw Error 即可）
- 不要在 stdout 輸出非結構化 log（用 stderr）
- 不要新增非 CommonJS 的語法（此 repo 無 transpiler）
- 不要 commit `node_modules/`

## 開發流程

```bash
npm install
node bin/treebuy-cli.js <指令> [選項]   # 直接跑，不需 build
```

新功能一律開分支 → PR，不直接 push main。
