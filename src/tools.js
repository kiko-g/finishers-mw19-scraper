async function toJsonFile(jsonObject, filename) {
  let fs = require("fs");
  fs.writeFile("./src/" + filename, JSON.stringify(jsonObject, null, 3), function () {
    return;
  });
}

module.exports = {
  toJsonFile: toJsonFile,
};
