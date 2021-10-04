function toJsonFile(jsonObject, filename) {
  let fs = require("fs");
  fs.writeFile("./src/" + filename, JSON.stringify(jsonObject, null, 3), function () {
    return;
  });
}

function printProgress(progress, prefix = "", suffix = "") {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(prefix);
  process.stdout.write(progress + "%");
  process.stdout.write(suffix);
}

function outerHTML(element) {
  var index = element.index();
  var parent = element.parent().clone();
  var child = parent.children()[index];
  parent.empty();
  parent.append(child);
  return parent.html();
}

module.exports = {
  toJsonFile: toJsonFile,
  printProgress: printProgress,
};
