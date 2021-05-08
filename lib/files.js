const decode = require('magnet-uri');
const torrentStream = require('torrent-stream')

const MAX_PEER_CONNECTIONS = process.env.MAX_PEER_CONNECTIONS || 20;

// const parseTorrent = require("parse-torrent");
// const url = "magnet:?xt=urn:btih:3DF4F9FD8ACD7B9B7FB424906AB9B2499B907D4E&dn=Yu%20Yu%20Hakusho%201080p%20%5bFullHD%5d&tr=udp%3a%2f%2fopen.nyaatorrents.info%3a6544%2fannounce&tr=udp%3a%2f%2fexodus.desync.com%3a6969%2fannounce";
// const torrentsInput = parseTorrent(url);


function filesAndSizeFromTorrentStream(torrent, timeout = 30000) {
  if (!torrent.infoHash && !torrent.magnetLink) {
    return Promise.reject(new Error("no infoHash or magnetLink"));
  }
  const magnet = torrent.magnetLink || decode.encode({ infoHash: torrent.infoHash, announce: torrent.trackers });
  return new Promise((resolve, rejected) => {
    const engine = new torrentStream(magnet, { connections: MAX_PEER_CONNECTIONS });

    engine.ready(() => {
      const files = engine.files
          .map((file, fileId) => ({
            fileIndex: fileId,
            name: file.name,
            path: file.path.replace(/^[^\/]+\//, ''),
            size: file.length
          }));
      const size = engine.torrent.length;

      engine.destroy();
      resolve({ files, size });
    });
    setTimeout(() => {
      engine.destroy();
      rejected(new Error('No available connections for torrent!'));
    }, timeout);
  });
}

module.exports = { filesAndSizeFromTorrentStream }