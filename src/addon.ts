import MetaDAO from './persistence/controllers/meta-dao';
import StreamDAO from './persistence/controllers/stream-dao';
import { API } from './lib/API';
import sortStreams from "./lib/sort";
import { setupConfig } from './config';

export async function createSeriesStreamHandler(args: any) {
	let api = new API();
	let [imdbId, season, episode] = args.id.split(':');
	const config = setupConfig();

	const name = await api.resolveName(args.type, imdbId);
	const query = name.replace(/(:)/g, '').replace(/( )/g, '+') + "+" + season + "a+temporada";
	const searchResult = await api.search(query);
	const streams: any = await api.getStream(searchResult, episode);
	const sortedStreams = sortStreams([].concat(...streams), config);

	return {
		streams: sortedStreams
	};
}
export function createCatalogHandler(args: any) {
    let metaDao = new MetaDAO()
    const skip = parseInt(args.extra.skip) || 0
    const limit = 100
    if (args.extra.search) {
        return metaDao.getByName(args.extra.search, skip, limit).then((metas) => {
            return {
                metas
            }
        }).catch((error) => {
            throw new Error(`Catalog Handler ERROR: ${error}`)
        })
    } else if (args.type == 'movie') {
        if (args.extra.genre) {
            return metaDao.getByGenre(args.id, args.extra.genre, skip, limit).then((metas) => {
                return {
                    metas
                }
            }).catch((error) => {
                throw new Error(`Catalog Handler ERROR: ${error}`)
            })
        }
        return metaDao.getByCatalogId(args.id, skip, limit).then((metas) => {
            return {
                metas
            }
        }).catch((error) => {
            throw new Error(`Catalog Handler ERROR: ${error}`)
        })
    }
}

export function createStreamHandler(args: any) {
    let streamDao = new StreamDAO();
    return streamDao.getByMetaId(args.id).then((streams) => {
        return {
            streams
        };
    }).catch((error) => {
        console.error(`Stream Handler ERROR: ${error}`);
        return {
            streams: []
        };
    });
}