const ShopifyAdapter =
  require("../adapters/shopify.adapter");

const AriikaAdapter =
  require("../adapters/ariika.adapter");

const MagentoAdapter =
  require("../adapters/magento.adapter");

const KemittAdapter =
  require("../adapters/kemitt.adapter");

const HomzmartAdapter =
  require("../adapters/homzmart.adapter");

const HomzoAdapter =
  require("../adapters/homzo.adapter");


function createScraper(config) {

  switch (config.platform) {

    case "shopify":

      if (
        config.site === "ariika"
      ) {

        return new AriikaAdapter(
          config
        );

      }

      return new ShopifyAdapter(
        config
      );


    case "kemitt":

      return new KemittAdapter(
        config
      );


    case "homzmart":

      return new HomzmartAdapter(
        config
      );


    case "homzo":

      return new HomzoAdapter(
        config
      );


    case "magento":

      return new MagentoAdapter(
        config
      );


    default:

      throw new Error(
        `Unsupported platform: ${config.platform}`
      );

  }

}


module.exports = {
  createScraper
};