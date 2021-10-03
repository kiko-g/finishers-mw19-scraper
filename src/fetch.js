const tools = require("./tools");
const axios = require("axios");
const cheerio = require("cheerio");
const armsDealerURL = "https://my.callofduty.com/player/store/sku/400039/title/mw";
const details = [];
const showcases = [];
const finishers = [];

/**
 * @brief fetch all finishers from codtracker.gg page by page using recursion,
 * and saves them in the finishers array and writes the same object in finishers.json
 * @param {boolean} verbose option to increase logs, default false
 * @param {number} index first page index, default 1
 */
async function fetchFinishers(verbose = false, index = 1) {
  const finishersURL = "https://cod.tracker.gg/modern-warfare/db/loot?c=9&page=" + index;
  axios(finishersURL)
    .then(function (response) {
      const html = response.data;
      const $ = cheerio.load(html);
      const found = $("table tbody tr", html);
      if (found.length === 0) {
        console.log("Found " + finishers.length + " finishers");
        tools.toJsonFile(finishers, "finishers.json");
      } else {
        found.each(function () {
          const title = $(this).find(".item-details__name").text();
          finishers.push({ id: finishers.length, title: title });
        });
        if (verbose) console.log("Page " + index + " done");
        fetchFinishers(verbose, index + 1);
      }
    })
    .catch((e) => console.error(e));
}

/**
 * @brief fetch all storeDay href entries for every day of the COD Store,
 * page by page using recursion, and saves them in the showcases array and showcases.json
 * @param {boolean} verbose option to increase logs, default false
 * @param {number} index first page index, default 1 (most recent showcases)
 */
async function fetchStoreHistory(verbose = false, index = 1) {
  const storeHistoryURL = "https://codmwstore.com/category/store/page/" + index;
  axios(storeHistoryURL)
    .then(function (response) {
      let html = response.data;
      let $ = cheerio.load(html);
      let found = $(".entry-title", html);

      if (found.length !== 0) {
        found.each(() => {
          let storeDayURL = $(this).find("a").attr("href");
          showcases.push({ id: showcases.length, url: storeDayURL });
        });
        if (verbose) console.log("Page " + index + " done");
        fetchStoreHistory(verbose, index + 1);
      }
    })
    .catch(() => {
      console.log("Found " + showcases.length + " showcases");
      tools.toJsonFile(showcases, "showcases.json");
    });
}

/**
 * @brief fetch all storeDay href entries for every day of the COD Store,
 * page by page using recursion, and saves them in the showcases array and showcases.json
 * @param {boolean} verbose option to increase logs, default true
 * @param {number} index first page index, default 1
 */
async function fetchStoreHistoryDetails(verbose = false, index = 1) {
  const storeHistoryURL = "https://codmwstore.com/category/store/page/" + index;
  axios(storeHistoryURL)
    .then(function (response) {
      let html = response.data;
      let $ = cheerio.load(html);
      let found = $(".entry-title", html);

      if (found.length !== 0) {
        found.each(function () {
          let storeDayURL = $(this).find("a").attr("href");
          showcases.push({ id: showcases.length, url: storeDayURL });
        });
        if (verbose) console.log("Page " + index + " done");
        fetchStoreHistoryDetails(verbose, index + 1);
      }
    })
    .catch(function () {
      console.log("Found " + showcases.length + " showcases");
      showcases.forEach((storeDay) => {
        axios(storeDay.url).then(function (response) {
          let html = response.data;
          let $ = cheerio.load(html);
          let found = $("div.entry-content-wrap", html);
          let bundles = [];

          found.each(function (i, e) {
            $(this)
              .find("a")
              .each(function (j, element) {
                let url = $(element).attr("href");
                console.log("\t" + j + "|" + url);
                bundles.push({ id: bundles.length, url: url });
              });
          });

          details.push({ id: details.length, bundles: bundles });
        });
      });
      tools.toJsonFile(details, "details.json");
    });
}

// @@ Exports
module.exports = {
  finishers: fetchFinishers,
  storeHistory: fetchStoreHistory,
  storeHistoryDetails: fetchStoreHistoryDetails,
};
