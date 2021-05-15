import { addonBuilder, Manifest } from "stremio-addon-sdk";
import { API } from './lib/API';
import sortStreams from "./lib/sort";
import { QualityFilter, Providers } from './mico/config';
import manifest from './manifest.json';

function setupConfig() {
	const config: any = {};
	config[Providers.key] = Providers.options.filter(provider => !provider.foreign).map(provider => provider.key);
	config[QualityFilter.key] = ['scr', 'cam'];
	config['lite'] = true;
	return config;
}

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

const builder = new addonBuilder(manifest as Manifest);
builder.defineStreamHandler(createSeriesStreamHandler);
export default builder.getInterface() as Object;