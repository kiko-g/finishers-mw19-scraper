const axios = require('axios')
const cheerio = require('cheerio')
const results = []

function grabFinishers(index) {
    //const storeURL = 'https://my.callofduty.com/player/store/sku/400039/title/mw'
    const finishersURL = 'https://cod.tracker.gg/modern-warfare/db/loot?c=9&page=' + index.toString()
    axios(finishersURL).then(function (response) {
        const html = response.data
        const $ = cheerio.load(html)
        const found = $('table tbody tr', html)

        if (found.length === 0) {
            console.log(results.length + ' finishers found')
        } else {
            found.each(function () {
                const title = $(this).find('.item-details__name').text()
                results.push({
                    id: results.length,
                    title: title,
                })
            })
            grabFinishers(index + 1)
        }
    }).catch(e => console.error(e))
}

function grabFinishersMaxPage(maxIndex) {
    for(let index = 1; index <= maxIndex; index++) {
        let url = 'https://cod.tracker.gg/modern-warfare/db/loot?c=9&page=' + index
        axios(url).then(function (response) {
            const html = response.data
            const $ = cheerio.load(html)
            const found = $('table tbody tr', html)

            if (found.length === 0) {
                console.log(results)
                console.log(results.length + ' finishers found')
            } else {
                found.each(function () {
                    const title = $(this).find('.item-details__name').text()
                    results.push({
                        id: results.length,
                        title: title,
                    })
                })
            }
        }).catch(e => console.error(e))
    }
}

grabFinishersMaxPage(12)
