---
name: treebuy-shared
description: "Common setup, installation, and security rules for all treebuy-cli skills."
---

# treebuy-shared

共用設定、安裝說明與安全規則，適用於所有 treebuy-cli 相關 skills。

## Installation

請參考官方專案 README 的安裝指引：

**GitHub Repository:**  
https://github.com/nandemo-agent/treebuy-cli

**安裝方式：**

```bash
# 建議固定版本安裝
npm install -g @nandemo-agent/treebuy-cli@0.1.0

# 或使用 npx 固定版本
npx @nandemo-agent/treebuy-cli@0.1.0 <command>
```

> 如需最新版本，請查看 [npm package 頁面](https://www.npmjs.com/package/@nandemo-agent/treebuy-cli)

**為什麼固定版本？**  
- 確保行為穩定，避免 breaking changes
- 方便 audit 與 security review
- 明確知道使用哪個版本的功能與 schema

## Authentication

目前 treebuy-cli 使用公開 API，無需身份驗證。

## Security & Privacy

### 資料隱私原則

- 所有資料來自公開的 treebuy.com API endpoints
- **不會儲存**任何使用者個資或查詢記錄
- 所有指令為**唯讀查詢**，不會修改任何資料

### 使用時注意事項（必讀）

**❌ 不要傳遞以下資訊：**
- 姓名、電話、地址、email
- 身分證字號、信用卡號、訂單編號
- 任何可識別個人身份的資料

**✅ 建議做法：**
- 查詢前先做**資料最小化**（data minimization）
- 只保留「對象/場合/預算/喜好」等一般性描述
- 移除所有可識別個人的細節

**範例：**
```
❌ 不好：「幫我找適合送給住台北市○○路的王小明的生日禮物」
✅ 良好：「30歲男性，喜歡運動，預算3000以內的生日禮物」
```

## Common Flags

treebuy-cli 多數指令支援以下常用 flags（具體請執行 `<command> --help` 確認）：

- `--json` — 完整 JSON 輸出（含 meta）
- `--ndjson` — 每筆一行 NDJSON
- `--fields <fields>` — 只輸出指定欄位（逗號分隔）
- `--help` — 顯示指令說明

詳細請參考各指令的 `--help` 輸出。

## Skill Development

若要開發新的 treebuy-cli skill:

1. 閱讀本 shared skill 的安裝與安全規則
2. 在 SKILL.md 開頭加上 PREREQUISITE reference
3. 避免在 skill 內直接寫 `npm install` 指令（容易被誤判為安全風險）
4. 改為引導 agent 閱讀本 shared skill 或專案 README

## Troubleshooting

### 常見問題

**Q: 商品連結打開顯示「找不到該頁面」？**  
A: 可能該商品已下架、權限不足、或站內條件限制。相關討論見 [Issue #22](https://github.com/nandemo-agent/treebuy-cli/issues/22)。

**Q: 如何確認 CLI 版本？**  
A: 執行 `treebuy-cli --version` 或 `npx @nandemo-agent/treebuy-cli@0.1.0 --version`

## Related Skills

- [treebuy-best-present](../treebuy-best-present/SKILL.md) — 依描述找合適禮物
- [treebuy-featured](../treebuy-featured/SKILL.md) — 查詢 Featured Campaign 商品

## References

- GitHub: https://github.com/nandemo-agent/treebuy-cli
- npm package: https://www.npmjs.com/package/@nandemo-agent/treebuy-cli
- Website: https://treebuy.com
