process.on(
  "unhandledRejection",
  error => {

    console.log(
      "An unexpected error occurred:"
    );

    console.log(
      error.message ||
        error.code ||
        "Unknown error"
    );

    process.exit(1);

  }
);

const fs =
  require("fs");

const path =
  require("path");

const readline =
  require("readline");

const sites =
  require("./src/sites");

const {
  createScraper
} =
  require("./src/core/scraper.factory");

const {
  normalizeProduct
} =
  require("./src/core/normalize");

const {
  saveJson
} =
  require("./src/core/file");

const {
  exportExcel
} =
  require("./src/core/exporter");

function sanitizeFilename(str) {

  return str
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^[-_]+|[-_]+$/g, "");

}

function getUniqueFilePath(
  dir,
  baseName,
  ext
) {

  let filePath =
    path.join(
      dir,
      `${baseName}${ext}`
    );

  let counter = 2;

  while (
    fs.existsSync(filePath)
  ) {

    filePath =
      path.join(
        dir,
        `${baseName}_${counter}${ext}`
      );

    counter++;

  }

  return filePath;

}

function ask(question) {

  const rl =
    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

  return new Promise(resolve => {

    rl.question(
      question,
      answer => {

        rl.close();

        resolve(answer);

      }
    );

  });

}

async function main() {

  const siteKeys =
    Object.keys(sites);

  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "      COMPETITOR SCRAPER SYSTEM"
  );
  console.log(
    "========================================"
  );
  console.log("");

  siteKeys.forEach(
    (site, index) => {

      const config =
        sites[site];

      console.log(
        `${index + 1} - ${config.site} (${config.platform})`
      );

    }
  );

  console.log("");
  console.log(
    "========================================"
  );
  console.log("");

  const choice =
    await ask(
      "Choose Site: "
    );

  const config =
    sites[
      siteKeys[
        Number(choice) - 1
      ]
    ];

  if (!config) {

    console.log(
      "Invalid Selection"
    );

    return;

  }

  console.log("");
  console.log(
    `Running ${config.site}`
  );
  console.log("");

  const scraper =
    createScraper(
      config
    );

  let products;

  let selectedCategory =
    null;

  const hasCategories =
    typeof scraper.getCategoryList ===
    "function";

  if (hasCategories) {

    console.log(
      "1 - Scrape All Categories"
    );

    console.log(
      "2 - Scrape a Specific Category"
    );

    console.log("");

    const catChoice =
      await ask(
        "Choose option: "
      );

    if (
      catChoice === "2"
    ) {

      console.log("");
      console.log(
        "Loading Categories..."
      );
      console.log("");

      const categoryList =
        await scraper.getCategoryList();

      categoryList.forEach(
        (cat, index) => {

          const count =
            cat.productCount;

          const entryLabel =
            count != null
              ? `${index + 1} - ${cat.name} (${cat.slug}) [${Number(count).toLocaleString()} products]`
              : `${index + 1} - ${cat.name} (${cat.slug})`;

          console.log(entryLabel);

        }
      );

      console.log("");

      const catPick =
        await ask(
          "Choose Category: "
        );

      selectedCategory =
        categoryList[
          Number(catPick) - 1
        ];

      if (!selectedCategory) {

        console.log(
          "Invalid Selection"
        );

        return;

      }

      console.log("");

      console.log(
        `Scraping ${selectedCategory.name}`
      );

      console.log("");

      products =
        await scraper.getProductsForCategory(
          selectedCategory
        );

    } else {

      products =
        await scraper.getProducts();

    }

  } else {

    products =
      await scraper.getProducts();

  }

  const dateStr =
    new Date()
      .toISOString()
      .slice(0, 10);

  let categoryName =
    "All_Categories";

  if (
    selectedCategory
  ) {

    const raw =
      selectedCategory.name ||
      "";

    const slug =
      selectedCategory.slug ||
      "";

    const cleanName =
      sanitizeFilename(raw);

    const cleanSlug =
      sanitizeFilename(slug);

    categoryName =
      cleanName.length > 3
        ? cleanName
        : cleanSlug ||
          cleanName ||
          "Category";

  }

  const outDir =
    `./src/outputs/${config.site}`;

  const baseName =
    `${config.site}_${categoryName}_${dateStr}`;

  const rawJsonPath =
    getUniqueFilePath(
      outDir,
      `${baseName}.raw`,
      ".json"
    );

  const cleanJsonPath =
    getUniqueFilePath(
      outDir,
      `${baseName}.clean`,
      ".json"
    );

  const excelPath =
    getUniqueFilePath(
      outDir,
      baseName,
      ".xlsx"
    );

  if (
    !products ||
    products.length === 0
  ) {

    console.log("");
    console.log(
      "WARNING: No products found for this category."
    );

    console.log(
      "Try selecting a different category or"
    );

    console.log(
      "choose 'Scrape All Categories' instead."
    );

    console.log("");

  }

  const cleanProducts =
    products.map(product =>
      normalizeProduct(
        product,
        config
      )
    );

  saveJson(
    rawJsonPath,
    products
  );

  saveJson(
    cleanJsonPath,
    cleanProducts
  );

  await exportExcel(
    cleanProducts,
    excelPath
  );

  console.log("");

console.log(
  "================================"
);

console.log(
  "SCRAPING COMPLETED"
);

console.log(
  "================================"
);

console.log(
  `Site       : ${config.site}`
);

console.log(
  `Platform   : ${config.platform}`
);

console.log(
  `Products   : ${cleanProducts.length}`
);

if (
  config.platform === "kemitt"
) {

  console.log(
    `Raw Total  : ${products.length}`
  );

  console.log(
    `Duplicates : ${
      products.length -
      cleanProducts.length
    }`
  );

}

console.log(
  `RAW JSON   : ${rawJsonPath}`
);

console.log(
  `CLEAN JSON : ${cleanJsonPath}`
);

console.log(
  `Excel File : ${excelPath}`
);

console.log(
  "================================"
);

}

main();
