# Competitor Scraper - Reference Documentation (Phase 1)

## Project Purpose

Build an advanced Node.js scraping platform capable of:

- Shopify stores
- Magento stores
- WooCommerce / WordPress stores
- React / Headless commerce stores

Target outputs:

- JSON
- XLSX
- CSV
- Future competitor comparison reports

Future goals:

- Image-based competitor matching
- Product similarity engine
- Category mapping engine
- Multi-site unified architecture

---

# Target Sites

## Vitrine Furniture

Platform: Shopify

Base URL:

https://vitrine-furniture.com

Results:

- Products: 4,802
- Collections: 103

Status:

- Working
- Public Shopify API available

---

## Chichomz

Platform: Shopify

Base URL:

https://chichomz.com

Results:

- Products: 12,700
- Collections: 250

Status:

- Working

Notes:

- Browser access works.
- Shopify JSON endpoints available.
- Occasional Cloudflare verification pages may appear when using Axios.

---

# Important Discovery

Do NOT rely on:

/collections/{handle}/products.json

as the primary source of products.

Reason:

Products may appear in multiple collections.

Example:

40451 collection product references

vs

4802 unique products

on Vitrine.

Correct approach:

products.json

is the primary product source.

collections.json

is used for category mapping.

---

# Current Architecture

Flow:

Site Config
    ↓
Adapter
    ↓
Raw Products
    ↓
Normalize
    ↓
Clean Data
    ↓
JSON Export
    ↓
Excel Export

---

# Folder Structure

competitor-scraper/

src/

adapters/
- shopify.adapter.js

core/
- request.js
- normalize.js
- clean.js
- exporter.js
- file.js

sites/

vitrine/
- config.js

chichomz/
- config.js

index.js

outputs/

vitrine/

chichomz/

---

# Shopify Endpoints

Products:

/products.json?limit=250&page=1

Collections:

/collections.json?limit=250

Collection Products:

/collections/{handle}/products.json

---

# Shopify Adapter Responsibilities

Methods:

getProducts()

Fetch all products using pagination.

getCollections()

Fetch all collections.

getCollectionProducts(handle)

Fetch collection products.

---

# request.js Purpose

Responsible for:

- Axios requests
- Timeouts
- Headers
- Error handling

Important export:

module.exports = {
  get
};

Missing this export causes:

TypeError: get is not a function

---

# Cleaning Layer

File:

src/core/clean.js

Purpose:

Remove:

- HTML
- Script tags
- Style tags
- Extra spaces
- Formatting noise

Applied to:

- title
- vendor
- description

---

# Normalization Layer

File:

src/core/normalize.js

Current normalized structure:

site

product_id

sku

title

handle

category

vendor

price

compare_price

discount_percent

has_discount

in_stock

images_count

product_url

main_image

description

tags

tags_string

scraped_at

---

# Main Image Fix

Original issue:

main_image was empty.

Solution:

product.image?.src ||
product.images?.[0]?.src ||
""

---

# Discount Calculation

Logic:

discount_percent

calculated from:

price

compare_price

Field:

has_discount

true when discount exists.

---

# Stock Strategy

inventory_quantity not available.

Current field:

in_stock

based on:

variant.available

---

# Excel Export System

Library:

exceljs

Features:

- Freeze Top Row
- Auto Filter
- Auto Column Width

Output:

products.xlsx

---

# Output Structure

outputs/

vitrine/
- products.clean.json
- products.xlsx

chichomz/
- products.clean.json
- products.xlsx

---

# Current app.js Workflow

1. Read site argument
2. Load site config
3. Run Shopify adapter
4. Fetch products
5. Normalize products
6. Save JSON
7. Export XLSX
8. Show statistics

Current execution:

npm start vitrine

npm start chichomz

---

# Current Statistics

Vitrine

Products:
4802

Collections:
103

---

Chichomz

Products:
12700

Unique:
12700

Collections:
250

---

# Refactor Goal (Next Phase)

Replace:

npm start vitrine

npm start chichomz

With:

Interactive menu

Example:

1 - Vitrine
2 - Chichomz
3 - Homzmart
4 - Raneen
5 - Kemitt

User selects site.

---

# Planned Category Mapping Engine

New fields:

parent_category

child_category

category_handle

category_products_count

Source:

collections.json

---

# Planned Image Matching Engine

Libraries:

sharp

imghash

Goal:

Detect identical products across competitors.

Future output:

Competitor URL

Matched Product

Similarity Score

Image Match Status

---

# Future Site Research

Homzmart

Raneen

Kemitt

Need platform discovery:

- Shopify
- Magento
- WooCommerce
- GraphQL
- React APIs

before adapter implementation.

---

# Important Lessons Learned

1. Always verify unique product count.

2. products.json is the master source.

3. collections.json is for category intelligence.

4. Keep raw data separate from clean data.

5. Normalize all sites into one schema.

6. Build adapters per platform, not per website.

---

# Phase 1 Status

Completed:

- Shopify adapter
- Vitrine integration
- Chichomz integration
- Normalization layer
- Cleaning layer
- Excel export
- JSON export

Next:

- App refactor
- Category mapping
- Image matching
- Additional competitors
