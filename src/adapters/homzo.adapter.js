const axios = require("axios");

class HomzoAdapter {

  constructor(config) {
    this.config = config;

    this.baseUrl =
      config.baseUrl || "https://homzoegypt.com";

    this.productsApi =
      config.productsApi ||
      `${this.baseUrl}/api/catalog/products`;

    this.perPage =
      config.perPage || 100;
  }

  async getProducts() {

    let page = 1;
    let allProducts = [];
    let lastPage = null;

    console.log("");
    console.log("================================");
    console.log("HOMZO PRODUCT SCRAPER");
    console.log("================================");
    console.log("");

    while (true) {

      console.log(
        `Fetching page ${page}${lastPage ? `/${lastPage}` : ""}...`
      );

      const response = await axios.get(
        this.productsApi,
        {
          params: {
            page,
            per_page: this.perPage,
          },

          timeout: 30000,

          headers: {
            Accept: "application/json",
          },
        }
      );

      const data =
        response.data || {};

      const products =
        Array.isArray(data.products)
          ? data.products
          : [];

      allProducts.push(
        ...products
      );

      /*
       * Homzo pagination
       */
      lastPage =
        data.lastPage ||
        data.last_page ||
        null;

      console.log(
        `Page ${page}${lastPage ? `/${lastPage}` : ""} | ${products.length} products`
      );

      /*
       * No products returned.
       */
      if (products.length === 0) {
        break;
      }

      /*
       * Last page reached.
       */
      if (
        lastPage &&
        page >= Number(lastPage)
      ) {
        break;
      }

      /*
       * Fallback if pagination metadata
       * is missing.
       */
      if (
        !lastPage &&
        products.length < this.perPage
      ) {
        break;
      }

      page++;
    }

    /*
     * Remove duplicates using SKU,
     * then slug as fallback.
     */
    const uniqueProducts =
      Array.from(
        new Map(
          allProducts.map(product => {

            const key =
              product.sku ||
              product.slug;

            return [
              key,
              product
            ];

          })
        ).values()
      );

    console.log("");

    console.log(
      "================================"
    );

    console.log(
      "RAW PRODUCTS:",
      allProducts.length
    );

    console.log(
      "UNIQUE PRODUCTS:",
      uniqueProducts.length
    );

    console.log(
      "REMOVED DUPLICATES:",
      allProducts.length -
      uniqueProducts.length
    );

    console.log(
      "================================"
    );

    console.log("");

    return uniqueProducts;
  }
}

module.exports =
  HomzoAdapter;