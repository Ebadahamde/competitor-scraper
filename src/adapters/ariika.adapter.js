const ShopifyAdapter =
  require("./shopify.adapter");

class AriikaAdapter extends ShopifyAdapter {

  constructor(config) {
    super(config);

    this.maxRetries = 3;
    this.requestDelay = 1000;
    this.retryDelay = 3000;
  }

  sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  async getCollectionProductsWithRetry(handle) {

    let page = 1;

    const products = [];

    while (true) {

      const url =
        `${this.config.baseUrl}/collections/${handle}/products.json?limit=250&page=${page}`;

      let success = false;

      for (
        let attempt = 1;
        attempt <= this.maxRetries;
        attempt++
      ) {

        try {

          const data =
            await this.getCollectionPage(url);

          const items =
            data?.products || [];

          if (items.length === 0) {
            return products;
          }

          products.push(...items);

          console.log(
            `    Page ${page} | ${items.length} products`
          );

          success = true;

          await this.sleep(
            this.requestDelay
          );

          page++;

          break;

        } catch (error) {

          const status =
            error?.response?.status;

          console.log(
            `    Page ${page} failed | Attempt ${attempt}/${this.maxRetries} | Status: ${status || "UNKNOWN"}`
          );

          if (
            attempt < this.maxRetries
          ) {

            const waitTime =
              this.retryDelay * attempt;

            console.log(
              `    Waiting ${waitTime / 1000}s before retry...`
            );

            await this.sleep(
              waitTime
            );
          }
        }
      }

      if (!success) {

        throw new Error(
          `Collection failed: ${handle} | Page: ${page}`
        );
      }
    }
  }

  async getCollectionPage(url) {

    const {
      get
    } = require("../core/request");

    return await get(url);
  }

  async getProducts() {

    const categories =
      await this.getCategoryList();

    const totalCategories =
      categories.length;

    let currentCategory = 0;

    const allProducts = [];

    const failedCategories = [];

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "ARIIKA - ALL CATEGORIES SCRAPE"
    );

    console.log(
      "========================================"
    );

    console.log("");

    console.log(
      `Categories Found: ${totalCategories}`
    );

    console.log("");

    /*
     * --------------------------------------------------
     * SCRAPE EACH COLLECTION
     * --------------------------------------------------
     */

    for (const category of categories) {

      currentCategory++;

      console.log("");

      console.log(
        `CATEGORY ${currentCategory}/${totalCategories}: ${category.name}`
      );

      console.log(
        `HANDLE: ${category.slug}`
      );

      try {

        const products =
          await this.getCollectionProductsWithRetry(
            category.slug
          );

        /*
         * ------------------------------------------------
         * ATTACH COLLECTION NAME TO EVERY PRODUCT
         * ------------------------------------------------
         *
         * The Shopify collection endpoint does not
         * return the collection name inside the product
         * object.
         *
         * Therefore we explicitly attach the current
         * collection before deduplication.
         */

        products.forEach(product => {

          if (
            !Array.isArray(
              product.collections
            )
          ) {
            product.collections = [];
          }

          if (
            category.name &&
            !product.collections.includes(
              category.name
            )
          ) {

            product.collections.push(
              category.name
            );
          }

        });

        /*
         * Add products to the master list.
         *
         * We intentionally keep duplicates here.
         * The same product can exist in many collections.
         */

        allProducts.push(
          ...products
        );

        const percent =
          (
            currentCategory /
            totalCategories
          ) * 100;

        const barSize = 30;

        const filled =
          Math.round(
            (
              percent /
              100
            ) * barSize
          );

        const progressBar =
          "█".repeat(filled) +
          "░".repeat(
            barSize - filled
          );

        console.log("");

        console.log(
          `[${currentCategory}/${totalCategories}] ${progressBar} ${percent.toFixed(1)}% | ${category.name} | ${products.length} products`
        );

      } catch (error) {

        failedCategories.push({

          name:
            category.name,

          slug:
            category.slug,

          error:
            error.message

        });

        console.log("");

        console.log(
          `FAILED CATEGORY: ${category.name}`
        );

        console.log(
          `Skipping category and continuing...`
        );

        console.log("");

        continue;
      }
    }

    /*
     * --------------------------------------------------
     * DEDUPLICATE PRODUCTS + MERGE COLLECTIONS
     * --------------------------------------------------
     *
     * Important:
     *
     * A product can appear in many collections.
     *
     * Example:
     *
     * Product X
     *   -> DINING SET
     *   -> DINING ROOM
     *   -> BEST SELLER DINING
     *
     * We keep ONE product record but merge ALL
     * collection names into that record.
     */

    const productMap =
      new Map();

    for (
      const product of allProducts
    ) {

      if (!product?.id) {
        continue;
      }

      /*
       * Normalize collections to an array.
       */

      const productCollections =
        Array.isArray(
          product.collections
        )
          ? product.collections
              .filter(Boolean)
          : [];

      /*
       * First time we see this product.
       */

      if (
        !productMap.has(
          product.id
        )
      ) {

        productMap.set(
          product.id,
          {
            ...product,

            collections:
              [
                ...new Set(
                  productCollections
                )
              ]

          }
        );

        continue;
      }

      /*
       * Product already exists.
       */

      const existing =
        productMap.get(
          product.id
        );

      const existingCollections =
        Array.isArray(
          existing.collections
        )
          ? existing.collections
          : [];

      /*
       * Merge old + new collections.
       */

      existing.collections =
        Array.from(
          new Set([
            ...existingCollections,
            ...productCollections
          ])
        );
    }

    const uniqueProducts =
      Array.from(
        productMap.values()
      );

    /*
     * --------------------------------------------------
     * DEBUG: DINING SET
     * --------------------------------------------------
     *
     * This lets us verify that the collection
     * information survived deduplication.
     */

    const diningSetProducts =
      uniqueProducts.filter(
        product =>
          Array.isArray(
            product.collections
          ) &&
          product.collections.some(
            collection =>
              collection
                .toLowerCase()
                .trim() ===
              "dining set"
          )
      );

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "DINING SET DEBUG"
    );

    console.log(
      "========================================"
    );

    console.log(
      `DINING SET PRODUCTS: ${diningSetProducts.length}`
    );

    if (
      diningSetProducts.length
    ) {

      diningSetProducts
        .slice(0, 10)
        .forEach(product => {

          console.log(
            `- ${product.title}`
          );

          console.log(
            `  ID: ${product.id}`
          );

          console.log(
            `  Collections: ${product.collections.join(" | ")}`
          );

        });
    }

    console.log(
      "========================================"
    );

    /*
     * --------------------------------------------------
     * SUMMARY
     * --------------------------------------------------
     */

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "ARIIKA SCRAPING SUMMARY"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Categories Found    : ${totalCategories}`
    );

    console.log(
      `Categories Processed: ${currentCategory}`
    );

    console.log(
      `Categories Failed   : ${failedCategories.length}`
    );

    console.log(
      `Raw Products        : ${allProducts.length}`
    );

    console.log(
      `Unique Products     : ${uniqueProducts.length}`
    );

    console.log(
      `Duplicates Removed  : ${
        allProducts.length -
        uniqueProducts.length
      }`
    );

    console.log(
      "========================================"
    );

    /*
     * --------------------------------------------------
     * FAILED CATEGORIES
     * --------------------------------------------------
     */

    if (
      failedCategories.length
    ) {

      console.log("");

      console.log(
        "FAILED CATEGORIES:"
      );

      failedCategories.forEach(
        (category, index) => {

          console.log(
            `${index + 1}. ${category.name} (${category.slug})`
          );

        }
      );
    }

    console.log("");

    return uniqueProducts;
  }
}

module.exports =
  AriikaAdapter;