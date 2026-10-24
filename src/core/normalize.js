const { cleanText } = require("./clean");

function normalizeProduct(product, config) {
  switch (config.platform) {
    case "shopify":
      return normalizeShopify(product, config);

    case "magento":
      return normalizeMagento(product, config);

    case "homzmart":
      return normalizeHomzmart(product, config);

    case "kemitt":
      return normalizeKemitt(product, config);

      case "homzo":
  return normalizeHomzo(product, config);

    default:
      return product;
  }
}

function normalizeHomzo(product, config) {
  const price = Number(
    String(product.price || "")
      .replace(/[^0-9.]/g, "") || 0
  );

  const comparePrice = Number(
    String(product.oldPrice || "")
      .replace(/[^0-9.]/g, "") || 0
  );

  const discountPercent =
    comparePrice > price
      ? Math.round(
          ((comparePrice - price) / comparePrice) * 100
        )
      : 0;

  const images = Array.isArray(product.images)
    ? product.images
        .filter(Boolean)
        .map(image =>
          image.startsWith("http")
            ? image
            : `${config.baseUrl}${image}`
        )
    : [];

  return {
    product_url: product.slug
      ? `${config.baseUrl}/product/${product.slug}`
      : "",

    site: config.site,

    platform: "homzo",

    product_id: product.slug || "",

    sku: product.sku || "",

    title: cleanText(
      product.titleEn ||
      product.title ||
      ""
    ),

    handle: product.slug || "",

    category: cleanText(
      product.categoryEn ||
      product.category ||
      ""
    ),

    categories: cleanText(
      product.categoryEn ||
      product.category ||
      ""
    ),

    price,

    compare_price: comparePrice,

    discount_percent: discountPercent,

    has_discount: discountPercent > 0,

    main_image:
      images[0] || "",

    images_count:
      images.length,

    gallery:
      images.join(" | "),

    description: cleanText(
      product.descriptionEn ||
      product.description ||
      ""
    ),

    stock_status:
      product.action === "cart",

    scraped_at:
      new Date().toISOString(),
  };
}

function normalizeShopify(product, config) {
  const variant = product.variants?.[0] || {};

  const price = Number(variant.price || 0);

  const comparePrice = Number(variant.compare_at_price || 0);

  const discountPercent =
    comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return {
    product_url: `${config.baseUrl}/products/${product.handle}`,

    site: config.site,

    platform: "shopify",

    product_id: product.id,

    sku: variant.sku || "",

    title: cleanText(product.title || ""),

    handle: product.handle || "",

    category:
      config.site === "ariika" && Array.isArray(product.collections)
        ? product.collections[0] || cleanText(product.product_type || "")
        : cleanText(product.product_type || ""),

    categories:
      config.site === "ariika" && Array.isArray(product.collections)
        ? product.collections
            .filter(Boolean)
            .map((name) => cleanText(name))
            .filter(Boolean)
            .join(" | ")
        : cleanText(product.product_type || ""),

    price,

    compare_price: comparePrice,

    discount_percent: discountPercent,

    has_discount: discountPercent > 0,

    main_image: product.image?.src || product.images?.[0]?.src || "",

    images_count: product.images?.length || 0,

    gallery: product.images?.map((img) => img.src).join(" | ") || "",

    description: cleanText(product.body_html || ""),

    stock_status: variant.available || false,

    scraped_at: new Date().toISOString(),
  };
}
function normalizeMagento(product, config) {
  const price = Number(
    product?.price_range?.minimum_price?.final_price?.value || 0,
  );

  const comparePrice = Number(
    product?.price_range?.minimum_price?.regular_price?.value || 0,
  );

  const discountPercent =
    comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return {
    product_url: `${config.baseUrl}/${product.url_key}`,

    site: config.site,

    platform: "magento",

    product_id: product.id,

    sku: product.sku || "",

    title: cleanText(product.name || ""),

    handle: product.url_key || "",

    category: product.categories?.[0]?.name || "",

    categories:
      product.categories?.map((cat) => cleanText(cat.name)).join(" | ") || "",

    price,

    compare_price: comparePrice,

    discount_percent: discountPercent,

    has_discount: discountPercent > 0,

    main_image: product.small_image?.url || "",

    images_count: product.small_image?.url ? 1 : 0,

    gallery: product.small_image?.url || "",

    description: cleanText(product.description?.html || ""),

    stock_status: product.stock_status === "IN_STOCK",

    scraped_at: new Date().toISOString(),
  };
}

function normalizeKemitt(product, config) {
  const price = Number(product.allPriceAfterOffer || 0);

  const comparePrice = Number(product.allPriceBeforeOffer || 0);

  const discountPercent =
    comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return {
    product_url: `${config.baseUrl}/en-eg/products/${product._id}`,

    site: config.site,

    platform: "kemitt",

    product_id: product._id || "",

    sku: product.sku || "",

    title: cleanText(product.arName || product.name || ""),

    handle: product.slug || "",

    category: cleanText(product.category || ""),

    categories: cleanText(product.category || ""),

    price,

    compare_price: comparePrice,

    discount_percent: discountPercent,

    has_discount: discountPercent > 0,

    main_image: product.primaryProductImagePath || "",

    images_count: product.images?.length || 0,

    gallery: product.images?.map((img) => img.path).join(" | ") || "",

    description: cleanText(product.arDescription || product.description || ""),

    stock_status: product.productStatus === true,

    scraped_at: new Date().toISOString(),
  };
}

function normalizeHomzmart(product, config) {
  const price = Number(
    product?.price_range?.minimum_price?.final_price?.value ||
      product?.special_price ||
      0,
  );

  const comparePrice = Number(
    product?.price_range?.minimum_price?.regular_price?.value || 0,
  );

  const discountPercent =
    comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return {
    product_url: product.url_key
      ? `${config.baseUrl}/p/${product.url_key}`
      : "",

    site: config.site,

    platform: "homzmart",

    product_id: product.id || "",

    sku: product.sku || "",

    title: cleanText(product.name || ""),

    handle: product.url_key || "",

    category: cleanText(product.category || ""),

    categories: cleanText(product.category || ""),

    price,

    compare_price: comparePrice,

    discount_percent: discountPercent,

    has_discount: discountPercent > 0,

    main_image: product.image?.url || "",

    images_count: product.media_gallery?.length || 0,

    gallery: product.media_gallery?.map((image) => image.url).join(" | ") || "",

    description: cleanText(product.description?.html || ""),

    stock_status: product.stock_status === "IN_STOCK",

    scraped_at: new Date().toISOString(),
  };
}

module.exports = {
  normalizeProduct,
};
