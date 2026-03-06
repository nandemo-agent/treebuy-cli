# API Response Schema — treebuy-cli

## GET /v2/campaign/featured_products/get

回傳：

```json
{
  "featured": [Campaign],
  "topic": [Campaign]
}
```

### Campaign 物件

```json
{
  "id": "01HE2S2BR1QBP3MQFR28ZSCFPF",
  "kind": "featured",
  "image_url": null,
  "mobile_image_url": null,
  "cta_button": null,
  "started_at": "2026-03-05T00:00:00",
  "ended_at": "2026-03-09T00:00:00",
  "products": [Product]
}
```

### Campaign.products 物件

```json
{
  "sku": "S26022480MZK",
  "var_id": "",
  "title": "商品名稱",
  "image_url": "https://img.treebuy-groot.com/...",
  "cta_open_in_new_window": true
}
```

---

## GET /v2/product/search

Query params：

| 參數 | 說明 | 預設 |
|------|------|------|
| `query` | 搜尋關鍵字（必填） | — |
| `page` | 頁碼（1-based） | 1 |
| `limit` | 每頁筆數 | 20 |
| `sort_by` | `rank` / `price_asc` / `price_desc` / `new` | `rank` |

回傳：

```json
{
  "hits": [SearchProduct],
  "facets": {
    "categories": [...],
    "available_delivery_type": [...]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_page": 23,
    "total_count": 67
  },
  "facet_category_path": []
}
```

### SearchProduct 物件

```json
{
  "id": "S23081450047",
  "name": "商品名稱",
  "brand_show": "品牌",
  "subtitle": "副標題",
  "special_title": null,
  "media_item": {
    "url": "https://img.treebuy-groot.com/...",
    "alt": null,
    "media_type": "image"
  },
  "image_id": "V1IMAGE...",
  "in_stock": true,
  "is_adult": false,
  "is_hidden": false,
  "is_launched": true,
  "is_preview": false,
  "has_multiple_price": false,
  "has_potential_promotion": false,
  "market_price": 758,
  "selling_price": 648,
  "point": 0,
  "promoted_price": null,
  "override_price_var_id": null,
  "categories": [{"id": 119, "name": "傢俱傢飾"}],
  "group_buy_rebate": null,
  "available_delivery_type": ["home_delivery"],
  "sales_type": "general"
}
```

---

## GET /v3/buyer/product/list

Query params：

| 參數 | 說明 |
|------|------|
| `product_ids` | 逗號分隔的 SKU 清單 |
| `_allow_hidden` | `false`（一般帶 false） |

回傳商品詳細資訊陣列（含價格、規格、圖片等）。
