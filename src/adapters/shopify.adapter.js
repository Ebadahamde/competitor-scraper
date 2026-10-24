const MAX_RETRIES = 5;
const MAX_RETRY_DELAY_MS = 60000;
const INITIAL_RETRY_DELAY_MS = 2000;
const PAGE_DELAY_MS = 1500;
const REQUEST_TIMEOUT_MS = 30000;

const RETRYABLE_STATUS_CODES = new Set([
  429,
  500,
  502,
  503,
  504
]);

const PERMANENT_STATUS_CODES = new Set([
  400,
  401,
  403,
  404
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseRetryAfterMs(value) {
  if (!value) {
    return null;
  }

  const trimmed = String(value).trim();

  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);

    if (Number.isFinite(seconds) && seconds >= 0) {
      return seconds * 1000;
    }

    return null;
  }

  const dateMs = Date.parse(trimmed);

  if (!Number.isNaN(dateMs)) {
    const delay = dateMs - Date.now();

    return delay > 0 ? delay : null;
  }

  return null;
}

function computeBackoffDelayMs(attempt) {
  const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);

  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

function isRetryableError(error) {
  if (error.status !== undefined) {
    if (PERMANENT_STATUS_CODES.has(error.status)) {
      return false;
    }

    return RETRYABLE_STATUS_CODES.has(error.status);
  }

  return (
    error.name === "AbortError" ||
    error.name === "TimeoutError" ||
    error.name === "TypeError"
  );
}

async function requestJson(url) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const body = await response.text();

    if (!response.ok) {
      const error = new Error(
        `Request failed with status code ${response.status}`
      );

      error.status = response.status;
      error.retryAfter = response.headers.get("retry-after");
      error.responseBody = body.slice(0, 500);

      throw error;
    }

    try {
      return JSON.parse(body);
    } catch {
      throw new Error(`Invalid JSON response from ${url}`);
    }
  } catch (error) {
    console.log("URL:", url);

    if (error.status !== undefined) {
      console.log("STATUS:", error.status);
      console.log("MESSAGE:", error.message);

      if (error.status === 429) {
        console.log(
          "RETRY-AFTER:",
          error.retryAfter || "Not provided"
        );

        if (error.responseBody) {
          console.log("RESPONSE BODY:", error.responseBody);
        }
      }
    } else {
      console.log("MESSAGE:", error.message);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getWithRetry(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await requestJson(url);
    } catch (error) {
      if (
        attempt === MAX_RETRIES ||
        !isRetryableError(error)
      ) {
        console.log(
          `RETRIES EXHAUSTED | URL: ${url} | STATUS: ${
            error.status || "UNKNOWN"
          } | MESSAGE: ${error.message}`
        );

        throw error;
      }

      const retryAfterMs =
        error.status === 429
          ? parseRetryAfterMs(error.retryAfter)
          : null;

      const delayMs =
        retryAfterMs ?? computeBackoffDelayMs(attempt + 1);

      console.log(
        `RETRY ${attempt + 1}/${MAX_RETRIES} | URL: ${url} | STATUS: ${
          error.status || "NETWORK ERROR"
        } | MESSAGE: ${error.message} | Waiting ${(
          delayMs / 1000
        ).toFixed(1)}s...`
      );

      await sleep(delayMs);
    }
  }
}

class ShopifyAdapter {
  constructor(config) {
    this.config = config;
  }

  async getCategoryList() {
    const data = await this.getCollections();

    const collections = data?.collections || [];

    return collections
      .filter(collection => {
        const count = collection.products_count;

        return count === undefined || count > 0;
      })
      .map(collection => ({
        name: collection.title || "",
        slug: collection.handle || "",
        productCount: collection.products_count ?? null
      }));
  }

  async getProductsForCategory(category) {
    return this.getCollectionProducts(category.slug);
  }

  async getCollections() {
    const url = `${this.config.baseUrl}/collections.json?limit=250`;

    return getWithRetry(url);
  }

  async getCollectionProducts(handle) {
    let page = 1;
    const products = [];

    while (true) {
      const url = `${this.config.baseUrl}/collections/${encodeURIComponent(handle)}/products.json?limit=250&page=${page}`;

      const data = await getWithRetry(url);

      if (
        !Array.isArray(data.products) ||
        data.products.length === 0
      ) {
        break;
      }

      products.push(...data.products);

      console.log(
        `Collection ${handle} | Products: ${products.length}`
      );

      await sleep(PAGE_DELAY_MS);

      page++;
    }

    return products;
  }

  async getProducts() {
    let page = 1;
    const allProducts = [];

    while (true) {
      const url = `${this.config.baseUrl}/products.json?limit=250&page=${page}`;

      console.log(`Fetching page ${page}`);

      const data = await getWithRetry(url);

      if (
        !Array.isArray(data.products) ||
        data.products.length === 0
      ) {
        break;
      }

      allProducts.push(...data.products);

      console.log(`Products: ${allProducts.length}`);

      await sleep(PAGE_DELAY_MS);

      page++;
    }

    return allProducts;
  }
}

module.exports = ShopifyAdapter;