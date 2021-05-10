const BTClient = require("bittorrent-tracker");
const parseTorrent = require("parse-torrent");
const async = require('async');
const needle = require('needle');
const decode = require('magnet-uri');

const TRACKERS_URL = 'https://ngosang.github.io/trackerslist/trackers_all.txt';
const SEEDS_CHECK_TIMEOUT = 15 * 1000; // 15 secs
const ADDITIONAL_TRACKERS = [
  'http://tracker.trackerfix.com:80/announce',
  'udp://9.rarbg.me:2780',
  'udp://9.rarbg.to:2870'
];
const ANIME_TRACKERS = [
  "http://nyaa.tracker.wf:7777/announce",
  "udp://anidex.moe:6969/announce",
  "udp://tracker-udp.anirena.com:80/announce",
  "udp://tracker.uw0.xyz:6969/announce"
];

const Type = {
  MOVIE: 'movie',
  SERIES: 'series',
  ANIME: 'anime'
};

const url = "magnet:?xt=urn:btih:568596006573d76622b99a16ee5fd2938a927a3a&dn=COMANDO.TO%20-%20Todas%20as%20Mulheres%20do%20Mundo%201%c2%aa%20Temporada%20Completa%202020%20%5b720p-FULL%5d&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce&tr=udp%3a%2f%2ftracker.coppersurfer.tk%3a6969%2fannounce&tr=udp%3a%2f%2fglotorrents.pw%3a6969%2fannounce&tr=udp%3a%2f%2ftracker4.piratux.com%3a6969%2fannounce&tr=udp%3a%2f%2fcoppersurfer.tk%3a6969%2fannounce&tr=http%3a%2f%2ft2.pow7.com%2fannounce&tr=udp%3a%2f%2ftracker.yify-torrents.com%3a80%2fannounce&tr=http%3a%2f%2fwww.h33t.com%3a3310%2fannounce&tr=http%3a%2f%2fexodus.desync.com%2fannounce&tr=http%3a%2f%2ftracker.coppersurfer.tk%3a6969%2fannounce&tr=http%3a%2f%2fbt.careland.com.cn%3a6969%2fannounce&tr=http%3a%2f%2fexodus.desync.com%3a6969%2fannounce&tr=udp%3a%2f%2ftracker.publicbt.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.istole.it%3a80%2fannounce&tr=http%3a%2f%2ftracker.blazing.de%2fannounce&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80%2fannounce&tr=http%3a%2f%2ftracker.yify-torrents.com%2fannounce&tr=udp%3a%2f%2ftracker.prq.to%2fannounce&tr=udp%3a%2f%2ftracker.1337x.org%3a80%2fannounce&tr=udp%3a%2f%2f9.rarbg.com%3a2740%2fannounce&tr=udp%3a%2f%2ftracker.ex.ua%3a80%2fannounce&tr=udp%3a%2f%2fipv4.tracker.harry.lu%3a80%2fannounce&tr=udp%3a%2f%2f12.rarbg.me%3a80%2fannounce&tr=udp%3a%2f%2ftracker.publicbt.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce&tr=udp%3a%2f%2f11.rarbg.com%2fannounce&tr=udp%3a%2f%2ftracker.ccc.de%3a80%2fannounce&tr=udp%3a%2f%2ffr33dom.h33t.com%3a3310%2fannounce&tr=udp%3a%2f%2fpublic.popcorn-tracker.org%3a6969%2fannounce";
const torrentsInput = parseTorrent(url);

async function _getAllTorrentsTrackers(torrents) {
  return Promise.all(torrents.map(torrent => _getTorrentTrackers(torrent)
    .then(torrentTrackers => ({
      infoHash: torrent.infoHash,
      trackers: torrentTrackers
    }))))
}

function _groupByTrackers(torrentsTrackers) {
  return torrentsTrackers.reduce((result, torrentTrackers) => {
      torrentTrackers.trackers.forEach(tracker =>
        result[tracker] = (result[tracker] || []).concat(torrentTrackers.infoHash));
      return result;
    }, {});
}


function _scrapeTrackersWithTimeout(mapTrackerInfoHash, callback) {
  setTimeout(callback, SEEDS_CHECK_TIMEOUT);

  async.each(Object.keys(mapTrackerInfoHash), function (tracker, ready) {
    BTClient.scrape({
      infoHash: mapTrackerInfoHash[tracker],
      announce: tracker
    }, (error, response) => {
      if (response) {
        const results = Array.isArray(torrentsInput) ? Object.entries(response) : [
          [response.infoHash, response]
        ];
        results
          .filter(([infoHash]) => perTorrentResults[infoHash])
          .forEach(([infoHash, seeders]) =>
            perTorrentResults[infoHash][tracker] = [seeders.complete, seeders.incomplete])
        successfullTrackersCount++;
      } else if (error) {
        mapTrackerInfoHash[tracker]
          .filter(infoHash => perTorrentResults[infoHash])
          .forEach(infoHash => perTorrentResults[infoHash][tracker] = [0, 0, error.message])
      }
      ready();
    })
  }, callback)
}


async function _getSeedersPerTorrent(torrentsInput) {
  return new Promise(async (resolve) => {
    const torrents = Array.isArray(torrentsInput) ? torrentsInput : [torrentsInput];
    const perTorrentResults = Object.fromEntries(new Map(torrents.map(torrent => [torrent.infoHash, {}])));
    const torrentsTrackers = await _getAllTorrentsTrackers(torrents);
    const perTrackerInfoHashes = _groupByTrackers(torrentsTrackers);


    let successfullTrackersCount = 0;
    const callback = () => {
      console.log(`[LOG] Total successful tracker responses: ${successfullTrackersCount}`)
      resolve(perTorrentResults);
    };
    _scrapeTrackersWithTimeout(perTrackerInfoHashes, callback);
  });
}

async function updateCurrentSeeders(torrents) {
  let perTorrentResults = _getSeedersPerTorrent(torrents);
  const torrentsArray = Array.isArray(torrents) ? torrents : [torrents];
  torrentsArray.forEach(torrent => {
    const results = perTorrentResults[torrent.infoHash];
    const newSeeders = Math.max(...Object.values(results).map(values => values[0]), 0);
    console.log(`Updating seeders for [${torrent.infoHash}] ${torrent.title} - ${torrent.seeders} -> ${newSeeders}`)
    torrent.seeders = newSeeders;
  });
  return torrents; // TODO: getStream expects a single value and not an array
}

async function _getTorrentTrackers(torrent) {
  const magnetTrackers = torrent.magnetLink && decode(torrent.magnetLink).tr || [];
  const torrentTrackers = torrent.trackers && torrent.trackers.split(',') || [];
  const defaultTrackers = await _getDefaultTrackers(torrent);
  return Array.from(new Set([].concat(magnetTrackers).concat(torrentTrackers).concat(defaultTrackers)));
}

async function _getDefaultTrackers(torrent, retry = 3) {
  return needle('get', TRACKERS_URL, {
      open_timeout: SEEDS_CHECK_TIMEOUT
    })
    .then(response => response.body && response.body.trim())
    .then(body => body && body.split('\n\n') || [])
    .catch(() => retry > 0 ? delay(5000).then(() => _getDefaultTrackers(torrent, retry - 1)) : [])
    .then(trackers => trackers.concat(ADDITIONAL_TRACKERS))
    .then(trackers => torrent.type === Type.ANIME ? trackers.concat(ANIME_TRACKERS) : trackers);
}

module.exports = {
  updateCurrentSeeders
}