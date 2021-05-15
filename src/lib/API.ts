import axios from "axios";
import parseTorrent from "parse-torrent";
import { parse } from "parse-torrent-title";
import { filesAndSizeFromTorrentStream } from "./files";
import { updateCurrentSeeders } from "./seeders";
const UNKNOWN_SIZE = 300000000;

function toHumanReadable(size: number): string | undefined {
    if (size === UNKNOWN_SIZE) {
        return undefined;
    }
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return Number((size / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export class API {
    async getStream(search: any, episode: string) {
        const url = `https://api-siteplaceholder.herokuapp.com/v1/magnet-source/detail?url=${search[0].desc_link}&encoded=false`
        const content = await axios.get(url)
        const data = content.data
        const stream = Promise.all(data.links.map(async (el: any) => {
            const torrentsInput = parseTorrent(el.url);
            const seeders = await updateCurrentSeeders(torrentsInput) // Fetch Seeders info from Torrent Trackers
            const {
                files
            } = await filesAndSizeFromTorrentStream(torrentsInput) // Get torrents' files
            const streams = files.files.map((el: any) => {
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
            const metas = streams.filter((streams: any) => streams.episode == episode)
                .map((el: any) => {
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
    async resolveName(type: string, imdbId: string, tmdbToken = "e4e9c05e1c65b5dc20e239cae5a88b2c") {
        var meta = await this.fetchMeta(imdbId, tmdbToken);
        return type === "movie" ? meta.movie_results[0].title : meta.tv_results[0].name;
    }

    async fetchMeta(imdbId: string, tmdbToken: string) {
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

    async search(query: string): Promise<any> {
        const url = `https://api-siteplaceholder.herokuapp.com/v1/magnet-source/search?url=comandotorrent&search_query=${query}&encoded=false`
        const search = await axios.get(url)
        return search.data
    }
}