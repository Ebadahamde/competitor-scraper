# Competitor Scraper Project Structure

## Project Overview

**Competitor Scraper** is a scalable Node.js application designed to scrape product catalogs from multiple ecommerce platforms through a unified adapter architecture.

The system normalizes product data into a common schema and exports the results as JSON and Excel files for competitor analysis and market research.

---

# Supported Platforms

| Platform                | Adapter             |
| ----------------------- | ------------------- |
| Shopify                 | shopify.adapter.js  |
| Magento                 | magento.adapter.js  |
| Custom GraphQL Platform | kemitt.adapter.js   |
| Custom REST Search API  | homzmart.adapter.js |

The architecture is adapter-based, making it easy to integrate additional ecommerce platforms.

---

# Folder Structure

```text
competitor-scraper/

│
├── app.js
│
├── package.json
├── package-lock.json
├── README.md
│
└── src
    │
    ├── adapters
    │   ├── shopify.adapter.js
    │   ├── magento.adapter.js
    │   ├── kemitt.adapter.js
    │   └── homzmart.adapter.js
    │
    ├── config
    │   ├── shopify.js
    │   ├── magento.js
    │   ├── kemitt.js
    │   └── homzmart.js
    │
    ├── core
    │   ├── scraper.factory.js
    │   ├── normalizer.js
    │   ├── clean.js
    │   ├── excel.js
    │   ├── file.js
    │   └── helpers.js
    │
    ├── outputs
    │   ├── site1
    │   ├── site2
    │   ├── site3
    │   ├── site4
    │   └── site5
    │
    └── utils
```

---

# Application Flow

```text
User

↓

Select Website

↓

Load Site Configuration

↓

Scraper Factory

↓

Create Adapter

↓

Discover Categories

↓

Paginate Products

↓

Collect Products

↓

Normalize Output

↓

Remove Duplicates

↓

Export JSON

↓

Export Excel
```

---

# Core Components

## app.js

Responsible for:

- Displaying available websites
- User selection
- Loading configuration
- Running scraper
- Exporting outputs

---

## scraper.factory.js

Creates the proper adapter according to:

```text
config.platform
```

Supported platforms:

- shopify
- magento
- kemitt
- homzmart

---

## Adapters

Each adapter is responsible for interacting with its own platform.

Responsibilities:

- Discover categories
- Handle pagination
- Fetch products
- Return raw product objects

Each adapter exposes:

```javascript
getProducts();
```

---

# Current Adapters

## Shopify

Data Source

```
products.json
```

Features

- Pagination
- Images
- Variants
- Collections

---

## Magento

Data Source

```
GraphQL
```

Features

- Categories
- Products
- Price Range
- Images

---

## Kemitt

Data Source

```
GraphQL API
```

Features

- Category Discovery
- Pagination
- Product Images
- Pricing

Current Improvement Planned

- Retry Logic
- Timeout Handling
- Request Delay

---

## Homzmart

Data Source

```
REST Search API
```

Workflow

1. Load Menu API
2. Discover all leaf categories
3. Loop categories
4. Paginate products
5. Remove duplicates
6. Normalize output

---

# Product Normalization

Every platform is transformed into one unified structure.

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

# Duplicate Removal

Products are deduplicated using:

```
SKU
```

Fallback:

```
Product ID
```

Implementation:

```
Map(SKU → Product)
```

---

# Output Files

Each execution generates:

```
products.raw.json
```

Raw collected data.

---

```
products.clean.json
```

Normalized product data.

---

```
products.xlsx
```

Excel file ready for filtering and analysis.

---

# Progress Tracking

Current implementation displays:

- Current category
- Current page
- Products collected
- Percentage completed
- Total products
- Unique products
- Duplicate count

---

# Utilities

Current helper modules:

- clean.js
- file.js
- excel.js
- helpers.js

Responsibilities:

- HTML cleaning
- JSON saving
- Excel generation
- Helper functions

---

# GitHub

Repository includes:

- README
- .gitignore
- Source Code
- Package Configuration

Installation

```bash
git clone <repo>

cd competitor-scraper

npm install

npm start
```

---

# Planned Improvements

## High Priority

- Retry mechanism
- Automatic timeout recovery
- Request throttling
- Better error handling

---

## Medium Priority

- Concurrent scraping
- Resume interrupted jobs
- Logging system
- Configuration profiles

---

## Future Roadmap

- WooCommerce Adapter
- BigCommerce Adapter
- OpenCart Adapter
- CSV Export
- Database Storage
- Image Downloader
- CLI Parameters
- Docker Support
- Proxy Rotation
- Headless Browser Support
- Scheduler
- Dashboard
- API Mode

---

# Technologies

- Node.js
- JavaScript
- Axios
- GraphQL
- REST APIs
- XLSX
- JSON
- Git
- GitHub

---

# Architecture Summary

```
UI
        │
        ▼
Site Config
        │
        ▼
Scraper Factory
        │
        ▼
Platform Adapter
        │
        ▼
Category Discovery
        │
        ▼
Pagination
        │
        ▼
Product Collection
        │
        ▼
Normalization
        │
        ▼
Duplicate Removal
        │
        ▼
JSON Export
        │
        ▼
Excel Export
```

---

This document represents the current architecture and implementation status of the Competitor Scraper project.
