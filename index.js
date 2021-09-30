const axios = require("axios")
const cheerio = require("cheerio")
const results = []

function grabFinishers(index, verbose = false) {
  //const storeURL = 'https://my.callofduty.com/player/store/sku/400039/title/mw'
  const finishersURL = "https://cod.tracker.gg/modern-warfare/db/loot?c=9&page=" + index
  axios(finishersURL).then(
    function (response) {
      const html = response.data
      const $ = cheerio.load(html)
      const found = $("table tbody tr", html)

      if (found.length === 0) {
        if (verbose) {
          console.log(results)
          console.log("No listings after page " + (index - 1).toString())
        }
        console.log("Found " + results.length + " finishers")
        dumpResults(results, "results.json")
      } else {
        found.each(function () {
          const title = $(this).find(".item-details__name").text()
          results.push({
            id: results.length,
            title: title,
          })
        })
        if (verbose) console.log("Page " + index + " done")
        grabFinishers(index + 1, verbose)
      }
    })
    .catch((e) => console.error(e))
}

function dumpResults(jsonObject, filename) {
  let fs = require("fs")
  fs.writeFile(
    "./" + filename,
    JSON.stringify(jsonObject, null, 3),
    function (error) {
      return
    }
  )
}

grabFinishers(1, true)
