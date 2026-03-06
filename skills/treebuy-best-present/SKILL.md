---
name: treebuy-best-present
description: "依一句話描述找合適的小樹購禮物。Use when: (1) 用戶說「幫我找禮物」「推薦適合的商品」「送○○什麼好」，(2) 需要依對象/場合/預算篩選多樣商品，(3) 想從 treebuy.com 找禮物選項。Triggers on: 找禮物, 推薦禮物, 送禮, 生日禮物, 母親節禮物, 小樹購禮物, best present, gift recommendation。"
---

# treebuy-best-present

依一句話描述，從小樹購（treebuy.com）找出類別多樣的合適禮物。

## 安裝

```bash
npx skills add https://github.com/nandemo-agent/treebuy-cli --skill treebuy-best-present
```

## 前置需求

```bash
# 安裝 treebuy-cli
npm install -g treebuy-cli
# 或直接 npx
npx treebuy-cli best-present "..."
```

## Agent Workflow

**這個 skill 最重要的一點：你（agent）自己就是最好的 keyword planner。**

### Step 1 — 分析用戶描述

從用戶描述解析：
- **對象**：媽媽、男友、同事、朋友…
- **場合**：生日、母親節、婚禮、過年…
- **喜好/興趣**：咖啡、登山、美妝…
- **預算**：明確金額 or 從描述推測

### Step 2 — 組出搜尋關鍵字（agent 自行思考）

生成 5–8 組不重疊類別的繁中搜尋關鍵字，確保涵蓋多種面向：

| 面向 | 範例關鍵字 |
|------|-----------|
| 美妝保養 | 保養品、香水、護手霜 |
| 食品飲品 | 茶葉禮盒、咖啡豆、零食禮盒 |
| 生活家居 | 香氛蠟燭、馬克杯、保溫杯 |
| 配件服飾 | 絲巾、皮夾、帽T |
| 健康運動 | 按摩器、運動水壺、保健食品 |

> 類別不要重疊，讓推薦結果多樣。

### Step 3 — 呼叫 CLI

```bash
# 用 --keywords 傳入你組好的關鍵字（bypass 規則式展開）
treebuy-cli best-present "<用戶原始描述>" \
  --keywords "<kw1>,<kw2>,<kw3>,..." \
  --budget <number> \
  --count <number> \
  --json
```

**旗標說明：**

| 旗標 | 說明 | 預設 |
|------|------|------|
| `--keywords` | 逗號分隔，最多 10 組，每組 ≤ 30 字 | （不設則用規則式） |
| `--budget` | 單件預算上限（NT$） | 從描述解析 |
| `--count` | 推薦幾件 | 5 |
| `--json` | 完整 JSON 輸出（含 meta） | — |
| `--ndjson` | 每筆一行 NDJSON | — |
| `--fields` | 只輸出指定欄位（作用於 recommendations[]） | 全部 |

### Step 4 — 後處理輸出

CLI 輸出格式（`--json`）：

```json
{
  "input": {"description": "...", "budget": 1000, "count": 5},
  "planner": "agent",
  "keywords_used": ["保養品", "香氛蠟燭", "..."],
  "recommendations": [
    {
      "sku": "S251021874L1",
      "name": "光影香氛蠟燭",
      "selling_price": 499,
      "source_keyword": "香氛蠟燭",
      "category_key": "119",
      "in_stock": true,
      "brand": "Besthot",
      "image_url": "https://img.treebuy-groot.com/..."
    }
  ]
}
```

**你（agent）可以在此基礎上：**
- 為每筆推薦補上一句推薦理由
- 根據用戶喜好排序
- 整理成自然語言回覆

## 完整範例

```bash
# 範例 1：母親節禮物
treebuy-cli best-present "我想送我媽一個母親節禮物，預算 1000" \
  --keywords "保養品,香氛蠟燭,茶葉禮盒,按摩器,限定禮盒" \
  --budget 1000 --count 5 --json

# 範例 2：登山愛好者
treebuy-cli best-present "朋友喜歡登山，預算 2000" \
  --keywords "登山背包,保溫水壺,運動襪,能量補給,登山帽" \
  --budget 2000 --json

# 範例 3：只看 sku/name/price
treebuy-cli best-present "送同事禮物 500 元以內" \
  --keywords "馬克杯,茶葉,零食禮盒,文具,手帕" \
  --budget 500 --fields sku,name,selling_price --ndjson
```

## 錯誤處理

- `--keywords` 驗證失敗 → stderr + exit 1（**不** silently fallback，確保 agent 知道 keywords 未生效）
- 找不到符合預算的商品 → stderr + exit 1
- 單一 keyword 搜尋失敗 → 跳過（不影響其他 keyword）

## Output Fields 參考

`recommendations[]` 的可用欄位（供 `--fields` 篩選）：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `sku` | string | 商品 SKU |
| `name` | string | 商品名稱 |
| `selling_price` | number | 售價 |
| `source_keyword` | string | 來源關鍵字 |
| `category_key` | string | 商品分類 key |
| `in_stock` | boolean | 是否有庫存 |
| `brand` | string | 品牌 |
| `image_url` | string | 商品圖片 URL |
