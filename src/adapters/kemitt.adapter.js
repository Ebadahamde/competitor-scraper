const axios = require("axios");

class KemittAdapter {

  constructor(config) {

    this.config = config;

  }

  async graphql(
    query,
    variables = {},
    operationName = null
  ) {

    const response =
      await axios.post(
        this.config.graphql,
        {
          operationName,
          variables,
          query
        },
        {
          headers: {
            "Content-Type":
              "application/json"
          },
          timeout: 30000
        }
      );

    return response.data;

  }

  async getCategories() {

    const query = `
    {
      getCategories {

        status_code

        data {

          _id

          name

          hasProducts

        }

      }
    }
    `;

    const data =
      await this.graphql(
        query
      );

    const categories =
      data?.data
        ?.getCategories
        ?.data || [];

    return categories.filter(
      category =>
        category.hasProducts
    );

  }

  async getCategoryList() {

    const raw =
      await this.getCategories();

    return raw.map(cat => ({

      name: cat.name || "",
      slug: cat._id || "",
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
    categoryId
  ) {

    const query = `
    query FilterProducts(
      $categories:[ID]!,
      $paginate:PaginateInput,
      $currentCountry:CurrentCountryEnum!,
      $allPriceBeforeOfferCurrentCountry2:CurrentCountryEnum!,
      $primaryProductImagePathCurrentCountry2:CurrentCountryEnum!
    ) {

      filterProducts(

        categories:$categories
        paginate:$paginate

      ) {

        data {

          pageInfo {

            hasNext
            totalCount
            totalPages
            page
            limit

          }

          items {

            _id

            sku

            name

            arName

            slug

            description

            arDescription

            totalDiscount

            allPriceAfterOffer(
              currentCountry:$currentCountry
            )

            allPriceBeforeOffer(
              currentCountry:$allPriceBeforeOfferCurrentCountry2
            )

            primaryProductImagePath(
              currentCountry:$primaryProductImagePathCurrentCountry2
            )

            productStatus

            images {

              path

              primaryImage

            }

          }

        }

      }

    }
    `;

    let page = 1;

    let products = [];

    while (true) {

      const variables = {

        categories: [
          categoryId
        ],

        currentCountry:
          "egypt",

        allPriceBeforeOfferCurrentCountry2:
          "egypt",

        primaryProductImagePathCurrentCountry2:
          "egypt",

        paginate: {

          page,

          limit: 36

        }

      };

      console.log(
        `Page ${page}`
      );

      const data =
        await this.graphql(
          query,
          variables,
          "FilterProducts"
        );

      const result =
        data?.data
          ?.filterProducts
          ?.data;

      if (!result) {
        break;
      }

      const items =
        result.items || [];

      products.push(
        ...items
      );

      console.log(
        `Products: ${products.length}/${result.pageInfo.totalCount}`
      );

      if (
        !result.pageInfo.hasNext
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

    console.log("");

    console.log(
      `Categories Found: ${categories.length}`
    );

    console.log("");

    let allProducts = [];

    for (
      const category of categories
    ) {

      console.log("");

      console.log(
        `Category: ${category.name}`
      );

      console.log("");

      const products =
        await this.getCategoryProducts(
          category._id
        );

      products.forEach(
        item => {

          item.category =
            category.name;

        }
      );

      allProducts.push(
        ...products
      );

      console.log("");

      console.log(
        `Total Collected: ${allProducts.length}`
      );

      console.log("");

    }

    const uniqueProducts =
      Array.from(

        new Map(

          allProducts.map(
            product => [

              product.sku ||
              product._id,

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
      "TOTAL PRODUCTS:",
      allProducts.length
    );

    console.log(
      "UNIQUE PRODUCTS:",
      uniqueProducts.length
    );

    console.log(
      "DUPLICATES:",
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
  KemittAdapter;