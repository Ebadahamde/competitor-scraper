const fs = require("fs");
const path = require("path");

function saveJson(filePath, data) {

  const dir =
    path.dirname(filePath);

  fs.mkdirSync(dir, {
    recursive: true
  });

  fs.writeFileSync(
    filePath,
    JSON.stringify(
      data,
      null,
      2
    ),
    "utf8"
  );

}

module.exports = {
  saveJson
};