# API Schema — treebuy featured

## GET /v2/campaign/featured_products/get

```json
{
  "featured": [Campaign],
  "topic": [Campaign]
}
```

### Campaign

```json
{
  "id": "01HE2S2BR1QBP3MQFR28ZSCFPF",
  "kind": "featured",
  "image_url": null,
  "mobile_image_url": null,
  "cta_button": null,
  "started_at": "2026-03-05T00:00:00",
  "ended_at": "2026-03-09T00:00:00",
  "products": [
    {
      "sku": "S26022480MZK",
      "var_id": "",
      "title": "商品名稱",
      "image_url": "https://img.treebuy-groot.com/...",
      "cta_open_in_new_window": true
    }
  ]
}
```

`topic` 類型多了 `image_url`、`mobile_image_url`、`cta_button`。
