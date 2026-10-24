# Competitor Scraper

Universal Ecommerce Competitor Scraper built with Node.js.

Supports multiple ecommerce platforms and exports normalized product data to JSON and Excel.

---

## Features

* Multi-site scraping architecture
* Adapter-based system
* Shopify support
* Magento support
* Custom API support
* Product normalization
* Excel export
* Raw JSON export
* Clean JSON export
* Automatic duplicate removal
* Category collection
* Pagination handling

---

## Supported Sites

| Site     | Platform       |
| -------- | -------------- |
| Vitrine  | Shopify        |
| Chichomz | Shopify        |
| Raneen   | Magento        |
| Kemitt   | Custom GraphQL |
| Homzmart | Custom API     |

---

## Project Structure

```text
src/
│
├── adapters/
│   ├── vitrine.adapter.js
│   ├── chichomz.adapter.js
│   ├── raneen.adapter.js
│   ├── kemitt.adapter.js
│   └── homzmart.adapter.js
│
├── core/
│   ├── normalize.js
│   ├── clean.js
│   ├── excel.js
│   └── json.js
│
├── sites/
│   ├── vitrine/
│   ├── chichomz/
│   ├── raneen/
│   ├── kemitt/
│   └── homzmart/
│
└── outputs/
```

---

## Installation

```bash
git clone https://github.com/USERNAME/competitor-scraper.git

cd competitor-scraper

npm install
```

---

## Run

```bash
npm start
```

Choose a site from the menu.

After selecting a website, you can choose to scrape all categories or a specific category:

```text
1 - Scrape All Categories
2 - Scrape a Specific Category

Choose option:
```

If **Specific Category** is selected, available categories are loaded and displayed with product counts (when available):

```text
Loading Categories...

1 - Living Room (1,245 products)
2 - Bedroom (842 products)
3 - Dining Room (391 products)
4 - Lighting (528 products)

Choose Category:
```

After selection, only the chosen category and its products will be scraped.

---

## Output

After completion:

```text
TOTAL PRODUCTS: xxxx
UNIQUE PRODUCTS: xxxx

RAW JSON
CLEAN JSON
EXCEL FILE
```

Generated files:

```text
src/outputs/{site}/products.raw.json
src/outputs/{site}/products.clean.json
src/outputs/{site}/products.xlsx
```

---

## Normalized Output Format

```json
{
  "site": "",
  "platform": "",
  "product_id": "",
  "sku": "",
  "title": "",
  "handle": "",
  "category": "",
  "categories": "",
  "price": 0,
  "compare_price": 0,
  "discount_percent": 0,
  "has_discount": false,
  "product_url": "",
  "main_image": "",
  "images_count": 0,
  "gallery": "",
  "description": "",
  "stock_status": true,
  "scraped_at": ""
}
```

---

## Adding New Website

1. Create site configuration

```text
src/sites/newsite/
```

2. Create adapter

```text
src/adapters/newsite.adapter.js
```

3. Register config

```js
module.exports = {
  ...
}
```

4. Register adapter

```js
switch(site) {
  ...
}
```

5. Run scraper

---

## Technologies

* Node.js
* Axios
* XLSX
* GraphQL
* REST APIs

---

## Author

Developed for ecommerce competitor intelligence and product catalog collection.
