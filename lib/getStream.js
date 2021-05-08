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

function formatSize(size) {
  if (size === UNKNOWN_SIZE) {
    return undefined;
  }
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return Number((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

async function getStream(search, episode) {
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
          title: `${el.name}\n👤 ${el.seeders} 💾 ${formatSize(el.size)}`,
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

module.exports = {
  getStream
}