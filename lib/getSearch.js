const axios = require('axios')

async function getSearch(query) {
    const url = `https://api-siteplaceholder.herokuapp.com/v1/magnet-source/search?url=comandotorrent&search_query=${query}&encoded=false`
    const search = await axios.get(url)
    return search.data
}

module.exports = { getSearch }