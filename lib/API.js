const axios = require('axios')
const axios = require('axios')
const parseTorrent = require("parse-torrent");
const {
    parse
} = require('parse-torrent-title')
const {
    filesAndSizeFromTorrentStream
} = require('./files');
const {
    updateCurrentSeeders
} = require('../seeders');
const UNKNOWN_SIZE = 300000000;

function toHumanReadable(size) {
    if (size === UNKNOWN_SIZE) {
        return undefined;
    }
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return Number((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

class API {
    async getStream(search, episode) {
        const url = `https://api-siteplaceholder.herokuapp.com/v1/magnet-source/detail?url=${search[0].desc_link}&encoded=false`
        const content = await axios.get(url)
        const data = content.data
        const stream = Promise.all(data.links.map(async (el) => {
            const torrentsInput = parseTorrent(el.url);
            const seeders = await updateCurrentSeeders(torrentsInput) // Fetch Seeders info from Torrent Trackers
            const {
                files
            } = await filesAndSizeFromTorrentStream(torrentsInput) // Get torrents' files
            const streams = files.files.map(el => {
                const parsed = parse(el.name)
                const data = {
                    name: el.name,
                    size: el.size,
                    fileIdx: el.fileIndex,
                    resolution: parsed.resolution,
                    source: parsed.source,
                    season: parsed.season,
                    episode: parsed.episode,
                    seeders: seeders.seeders,
                    infoHash: seeders.infoHash // torrentsInput.infoHash
                }
                return data
            })
            const metas = streams.filter(streams => streams.episode == episode)
                .map(el => {
                    return {
                        name: `Novo Addon\n${el.resolution}`,
                        title: `${el.name}\n👤 ${el.seeders} 💾 ${toHumanReadable(el.size)}`,
                        infoHash: el.infoHash,
                        fileIdx: el.fileIdx,
                        behaviorHints: {
                            bingeGroup: `novoaddon|${el.infoHash}`
                        }
                    };
                });
            return metas
        }))
        return stream
    }
    async resolveName(type, imdbId, tmdbToken = "e4e9c05e1c65b5dc20e239cae5a88b2c") {
        var meta = await this.fetchMeta(imdbId, tmdbToken);
        return type === "movie" ? meta.movie_results[0].title : meta.tv_results[0].name;
    }

    async fetchMeta(imdbId, tmdbToken) {
        try {
            var meta = (
                await axios.get(
                    `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbToken}&language=pt-BR&external_source=imdb_id`
                )
            ).data;
        } catch (error) {
            console.error(`The MovieDB id retrieval failed with http status ${error.response.status}`);
        }
        return meta;
    }

    async search(query) {
        const url = `https://api-siteplaceholder.herokuapp.com/v1/magnet-source/search?url=comandotorrent&search_query=${query}&encoded=false`
        const search = await axios.get(url)
        return search.data
    }
}

module.exports = {
    API
}