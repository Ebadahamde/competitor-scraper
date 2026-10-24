const axios = require("axios");

class HomzmartAdapter {

  constructor(config) {

    this.config = config;

  }

  async getCategories() {

    console.log("");
    console.log("Loading Categories...");
    console.log("");

    const response =
      await axios.get(
        this.config.menuApi,
        {
          timeout: 30000
        }
      );

    const categories = [];

    function walk(items) {

      if (!Array.isArray(items)) {
        return;
      }

      items.forEach(item => {

        if (
          item.url_path &&
          item.url_path.startsWith("/c/") &&
          (
            !item.children ||
            item.children.length === 0
          )
        ) {

          categories.push({

            id:
              item.category_id || "",

            name:
              item.name || "",

            url:
              item.url_path,

            urlKey:
              item.url_path
                .replace("/c/", "")
                .replace(/^\/+/, "")
                .replace(/\/+$/, "")

          });

        }

        if (
          item.children &&
          item.children.length
        ) {

          walk(
            item.children
          );

        }

      });

    }

    walk(
      response.data?.menu?.items || []
    );

    return categories;

  }

  async getCategoryList() {

    const raw =
      await this.getCategories();

    return raw.map(cat => ({

      name: cat.name || "",
      slug: cat.urlKey || "",
      productCount: null

    }));

  }

  async getProductsForCategory(
    category
  ) {

    return this.getCategoryProducts(
      category.slug
    );

  }

  async getCategoryProducts(
    urlKey
  ) {

    let page = 1;

    let products = [];

    while (true) {

      const response =
        await axios.post(
          this.config.productsApi,
          {
            currentPage: page,
            pageSize: 100,
            lang: "ar",
            filter: {
              url_key: [urlKey],
              stock_status: "0"
            },
            sort: "default"
          },
          {
            headers: {
              "content-type":
                "application/json"
            },
            timeout: 30000
          }
        );

      const result =
        response.data?.data?.products;

      if (!result) {
        break;
      }

      const items =
        result.items || [];

      products.push(
        ...items
      );

      console.log(
        `Page ${page}/${result.page_info.total_pages} | ${items.length} products`
      );

      if (
        page >=
        result.page_info.total_pages
      ) {
        break;
      }

      page++;

    }

    return products;

  }

  async getProducts() {

    const categories =
      await this.getCategories();

    const totalCategories =
      categories.length;

    let currentCategory = 0;

    console.log("");

    console.log(
      "CATEGORIES FOUND:",
      totalCategories
    );

    console.log("");

    let allProducts = [];

    for (
      const category of categories
    ) {

      currentCategory++;

      const percent =
        (
          currentCategory /
          totalCategories
        ) * 100;

      console.log("");

      console.log(
        `[${currentCategory}/${totalCategories}] ${percent.toFixed(1)}%`
      );

      console.log(
        `CATEGORY: ${category.name}`
      );

      console.log(
        `URL KEY: ${category.urlKey}`
      );

      console.log("");

      try {

        const products =
          await this.getCategoryProducts(
            category.urlKey
          );

        products.forEach(
          product => {

            product.category =
              category.name;

            delete product.variants;
            delete product.attributes;
            delete product.social_proof;
            delete product.configurable_options;
            delete product.product_attributes;
            delete product.flash_sale;

          }
        );

        allProducts.push(
          ...products
        );

        console.log(
          `TOTAL COLLECTED: ${allProducts.length}`
        );

      } catch (error) {

        console.log(
          `FAILED: ${category.name}`
        );

        console.log(
          error.message
        );

      }

    }

    const uniqueProducts =
      Array.from(

        new Map(

          allProducts.map(
            product => [

              product.sku ||
              product.id,

              product

            ]
          )

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

    return uniqueProducts;

  }

}

module.exports =
  HomzmartAdapter;