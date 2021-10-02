const axios = require("axios")
const cheerio = require("cheerio")
const armsDealerURL = 'https://my.callofduty.com/player/store/sku/400039/title/mw'
const details = []
const bundles = []
const finishers = []



/**
 * @brief fetch all finishers from codtracker.gg page by page using recursion, 
 * and saves them in the finishers array and writes the same object in finishers.json
 * @param {boolean} verbose option to increase logs, default false
 * @param {number} index first page index, default 1
 */
async function fetchFinishers(verbose = false, index = 1) {
  const finishersURL = "https://cod.tracker.gg/modern-warfare/db/loot?c=9&page=" + index
  axios(finishersURL).then(
    function (response) {
      const html = response.data
      const $ = cheerio.load(html)
      const found = $("table tbody tr", html)
      if (found.length === 0) {
        console.log("Found " + finishers.length + " finishers")
        toJsonFile(finishers, "finishers.json")
      }
      else {
        found.each(function () {
          const title = $(this).find(".item-details__name").text()
          finishers.push({ id: finishers.length, title: title })
        })
        if (verbose) console.log("Page " + index + " done")
        fetchFinishers(verbose, index + 1)
      }
    }).catch((e) => console.error(e))
}


/**
 * @brief fetch all bundle href entries for every day of the COD Store,
 * page by page using recursion, and saves them in the bundles array and bundles.json
 * @param {boolean} verbose option to increase logs, default false
 * @param {number} index first page index, default 1 (most recent bundles)
 */
async function fetchStoreHistory(verbose = false, index = 1) {
  const storeHistoryURL = "https://codmwstore.com/category/store/page/" + index
  axios(storeHistoryURL).then(
    function (response) {
      const html = response.data
      const $ = cheerio.load(html)
      const found = $(".entry-title", html)

      if (found.length !== 0) {
        found.each(function () {
          const bundleURL = $(this).find("a").attr("href")
          bundles.push({ id: bundles.length, url: bundleURL })
        })
        if (verbose) console.log("Page " + index + " done")
        fetchStoreHistory(verbose, index + 1)
      }
    }).catch(() => {
      console.log("Found " + bundles.length + " bundles")
      toJsonFile(bundles, "bundles.json")
    })
}


/**
 * @brief fetch all bundle href entries for every day of the COD Store,
 * page by page using recursion, and saves them in the bundles array and bundles.json
 * @param {boolean} verbose option to increase logs, default true
 * @param {number} index first page index, default 1
 */
async function fetchStoreHistoryDetails(verbose = false, index = 1) {
  const storeHistoryURL = "https://codmwstore.com/category/store/page/" + index
  axios(storeHistoryURL).then(
    function (response) {
      const html = response.data
      const $ = cheerio.load(html)
      const found = $(".entry-title", html)

      if (found.length !== 0) {
        found.each(function () {
          const bundleURL = $(this).find("a").attr("href")
          bundles.push({ id: bundles.length, url: bundleURL })
        })
        if (verbose) console.log("Page " + index + " done")
        fetchStoreHistory(verbose, index + 1)
      }
    }).catch(() => {
      console.log("Found " + bundles.length + " bundles")
      console.log(bundles[0]);
      toJsonFile(bundles, "bundles.json")
    })

}




async function toJsonFile(jsonObject, filename) {
  let fs = require("fs")
  fs.writeFile(
    "./src/" + filename,
    JSON.stringify(jsonObject, null, 3),
    function () {
      return
    }
  )
}


/**
 * @brief export fetch functions as module
 */
module.exports = {
  finishers: fetchFinishers,
  storeHistory: fetchStoreHistory,
  storeHistoryDetails: fetchStoreHistoryDetails,
}
