# API Schema — treebuy search

## GET /v2/product/search

Query params：`query`（必填）、`page`、`limit`（max 50）、`sort_by`

```json
{
  "hits": [SearchProduct],
  "facets": {
    "categories": [{"id": 119, "name": "傢俱傢飾"}],
    "available_delivery_type": ["home_delivery"]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_page": 23,
    "total_count": 67
  }
}
```

### SearchProduct

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
  "in_stock": true,
  "market_price": 758,
  "selling_price": 648,
  "promoted_price": null,
  "point": 0,
  "categories": [{"id": 119, "name": "傢俱傢飾"}],
  "available_delivery_type": ["home_delivery"],
  "sales_type": "general"
}
```

## 常用 Workflow

### 找最便宜有貨商品

```bash
treebuy-cli search products "Dyson" \
  --sort-by price_asc --limit 20 \
  --fields id,name,selling_price,in_stock \
  --ndjson | grep '"in_stock":true' | head -1
```

### 多頁掃描

```bash
for page in 1 2 3; do
  treebuy-cli search products "按摩椅" --page $page --ndjson --fields id,name,selling_price
done
```
