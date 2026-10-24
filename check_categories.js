const { get } = require("./src/core/request");

async function main() {
  const baseUrl = "https://chichomz.com";

  // 1. Fetch all collections
  console.log("Fetching all collections...");
  let allCollections = [];
  let page = 1;

  while (true) {
    const url = `${baseUrl}/collections.json?limit=250&page=${page}`;
    const data = await get(url);
    const cols = data?.collections || [];
    if (cols.length === 0) break;
    // Filter out the "frontpage" collection (auto-created by Shopify, all products)
    allCollections.push(...cols.filter(c => c.handle !== "frontpage"));
    if (cols.length < 250) break;
    page++;
  }

  console.log(`Total collections to check: ${allCollections.length}\n`);

  // 2. Check each collection for products
  let emptyCategories = [];
  let withProducts = 0;

  for (let i = 0; i < allCollections.length; i++) {
    const col = allCollections[i];
    let total = 0;
    let p = 1;

    while (true) {
      const url = `${baseUrl}/collections/${col.handle}/products.json?limit=250&page=${p}`;
      const data = await get(url);
      const prods = data?.products || [];
      total += prods.length;
      if (prods.length < 250) break;
      p++;
    }

    if (total === 0) {
      emptyCategories.push(col.handle);
      console.log(`  EMPTY: ${col.handle} (${col.title || col.handle})`);
    } else {
      withProducts++;
    }
  }

  // 3. Summary
  console.log(`\n=== Summary ===`);
  console.log(`Collections with products : ${withProducts}`);
  console.log(`Empty collections         : ${emptyCategories.length}`);

  if (emptyCategories.length > 0) {
    console.log(`\nEmpty collection handles:`);
    emptyCategories.forEach(h => console.log(`  - ${h}`));
  } else {
    console.log(`\n✅ All collections have products!`);
  }
}

main().catch(console.error);
