const { addonBuilder } = require("stremio-addon-sdk")
const { getName } = require('./lib/getName')
const { getSearch } = require("./lib/getSearch")
const { getStream } = require("./lib/getStream")
const sortStreams = require("./sort")
const { QualityFilter, Providers } = require('./filter')

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

function liteConfig() {
	const config = {};
	config[Providers.key] = Providers.options.filter(provider => !provider.foreign).map(provider => provider.key);
	config[QualityFilter.key] = ['scr', 'cam']
	config['limit'] = 1;
	config['lite'] = true;
	return config;
}

builder.defineStreamHandler(async ({type, id}) => {
	let [imdbId, season, episode] = id.split(':')
	const name = await getName(type, imdbId)
	const query = name.replace(/(:)/g, '') .replace(/( )/g, '+') + "+" + season + "a+temporada"
	const search = await getSearch(query)
	const streams = await getStream(search, episode)
	const config = liteConfig()
	const sort = sortStreams([].concat(...streams), config)

	return Promise.resolve({ streams: sort })
})

module.exports = builder.getInterface()