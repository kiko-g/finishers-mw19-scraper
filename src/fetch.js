const tools = require("./tools");
const axios = require("axios");
const cheerio = require("cheerio");
const finishers = [];
const showcases = [];
const details = [];
// const armsDealerURL = "https://my.callofduty.com/player/store/sku/400039/title/mw";

/**
 * @brief fetch all finishers from codtracker.gg page by page using recursion,
 * and saves them in the finishers array and writes the same object in finishers.json
 * @param {number} index first page index, default 1
 */
async function fetchFinishers(index = 1, handler = finishersHandler) {
  return new Promise(() => {
    const finishersURL = "https://cod.tracker.gg/modern-warfare/db/loot?c=9&page=" + index;
    axios(finishersURL)
      .then(function (response) {
        const html = response.data;
        const $ = cheerio.load(html);
        const found = $("table tbody tr", html);
        if (found.length === 0) {
          return handler("Found " + finishers.length + " finishers (" + (index - 1) + " pages)");
        } else {
          found.each(function () {
            finishers.push({
              id: finishers.length,
              title: $(this).find(".item-details__name").text(),
            });
          });
          fetchFinishers(index + 1);
        }
      })
      .catch((e) => console.log(e));
  });
}

/**
 * @brief fetch all storeDay href entries for every day of the COD Store,
 * page by page using recursion, and saves them in the showcases array and showcases.json
 * @param {number} index first store history page index, default 1 (most recent showcases)
 */
async function fetchStoreHistory(index = 1, handler = storeHistoryHandler) {
  return new Promise(() => {
    axios("https://codmwstore.com/category/store/page/" + index)
      .then(function (response) {
        const html = response.data;
        const $ = cheerio.load(html);
        const found = $(".entry-title", html);
        if (found.length !== 0) {
          found.each(function () {
            showcases.push({ id: showcases.length, url: $(this).find("a").attr("href") });
          });
          fetchStoreHistory(index + 1, handler);
        }
      })
      .catch(() => handler("Found " + showcases.length + " showcases (" + (index - 1) + " pages)"));
  });
}

/**
 * @brief after running fetch store history, a different handler which will investigate every showcase
 * and gather all the bundle urls and save them on the details array and details.json
 * @param {number} index first store history page index, default 1
 */
async function fetchStoreHistoryDetails(index = 1, handler = storeHistoryDetailsHandler) {
  fetchStoreHistory(index, handler);
}

// @@ Handlers
async function finishersHandler(message) {
  console.log(message);
  tools.toJsonFile(finishers, "finishers.json");
  return finishers;
}

async function storeHistoryHandler(message) {
  console.log(message);
  tools.toJsonFile(showcases, "showcases.json");
  return showcases;
}

async function storeHistoryDetailsHandler(message) {
  console.log(message);
  getBundle(0, (msg) => {
    console.log(msg);
    tools.toJsonFile(details, "details.json");
    return details;
  });
}

async function getBundle(showcaseIndex, handler) {
  const showcase = showcases[showcaseIndex];
  axios(showcase.url)
    .then(function (response) {
      console.log("Parsing showcase " + (showcaseIndex + 1));
      const bundles = [];
      const html = response.data;
      const $ = cheerio.load(html);
      const found = $("a", html).toArray();
      const urls = found.map((item) => $(item).attr("href"));

      urls.forEach((value) => bundles.push({ url: value }));
      details.push({ id: details.length, bundles: bundles });

      if (showcaseIndex + 1 !== showcases.length) getBundle(showcaseIndex + 1);
      else handler("Parsed all " + showcases.length + "showcases");
    })
    .catch((e) => console.log(e));
}

// @@ Exports
module.exports = {
  finishers: fetchFinishers,
  storeHistory: fetchStoreHistory,
  storeHistoryDetails: fetchStoreHistoryDetails,
};
