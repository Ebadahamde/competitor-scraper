const axios = require("axios");

class MagentoAdapter {

  constructor(config) {
    this.config = config;
  }

  async graphql(query) {

    const url =
      `${this.config.graphql}?query=${encodeURIComponent(query)}`;

    const response =
      await axios.get(url, {
        timeout: 30000
      });

    return response.data;

  }

  async getProducts() {

    let page = 1;

    let allProducts = [];

    let totalCount = 0;

    while (true) {

      console.log(
        `Fetching page ${page}`
      );

      const query = `
      {
        products(
          search:" "
          pageSize:100
          currentPage:${page}
        ) {

          total_count

          items {

            id

            sku

            name

            url_key

            stock_status

            categories {
              uid
              name
            }

            description {
              html
            }

            small_image {
              url
            }

            price_range {

              minimum_price {

                final_price {
                  value
                }

                regular_price {
                  value
                }

              }

            }

          }

        }
      }
      `;

      const data =
        await this.graphql(query);

      const products =
        data?.data?.products;

      const items =
        products?.items || [];

      totalCount =
        products?.total_count || 0;

      if (!items.length) {
        break;
      }

      allProducts.push(
        ...items
      );

      console.log(
        `Products: ${allProducts.length}/${totalCount}`
      );

      if (
        allProducts.length >= totalCount
      ) {
        break;
      }

      page++;

    }

    return allProducts;

  }

}

module.exports =
  MagentoAdapter;