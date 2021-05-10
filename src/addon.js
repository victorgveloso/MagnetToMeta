const {
	addonBuilder
} = require("stremio-addon-sdk")
const {
	API
} = require('./lib/API')
const sortStreams = require("./lib/sort")
const {
	QualityFilter,
	Providers
} = require('./config')

const manifest = {
	"id": "community.",
	"version": "0.0.1",
	"catalogs": [],
	"resources": [
		"stream"
	],
	"types": [
		"movie",
		"series"
	],
	"name": "Novo Addon",
	"description": "",
	"idPrefixes": [
		"tt"
	]
}
const builder = new addonBuilder(manifest)

function setupConfig() {
	const config = {};
	config[Providers.key] = Providers.options.filter(provider => !provider.foreign).map(provider => provider.key);
	config[QualityFilter.key] = ['scr', 'cam']
	config['lite'] = true;
	return config;
}

builder.defineStreamHandler(async ({
	type,
	id
}) => {
	let api = new API();
	let [imdbId, season, episode] = id.split(':')
	const name = await api.resolveName(type, imdbId)
	const query = name.replace(/(:)/g, '').replace(/( )/g, '+') + "+" + season + "a+temporada"
	const searchResult = await api.search(query)
	const streams = await api.getStream(searchResult, episode)
	const config = setupConfig()
	const sort = sortStreams([].concat(...streams), config)

	return Promise.resolve({
		streams: sort
	})
})

module.exports = builder.getInterface()