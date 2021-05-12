const express = require('express')
const fs = require('fs')
const path = require('path')
const {
	getRouter: getDefaultRouter
} = require('stremio-addon-sdk')
const landingTemplate = require('stremio-addon-sdk/src/landingTemplate')
const opn = require('opn')

function serveHTTP(addonInterface, opts = {}) {

	const app = createCachedServer(addonInterface, opts);
	//Set-up endpoints
	app.use(getRouter(opts, addonInterface));
	serveStatic(opts, app);
	serveLandingPage(addonInterface, app);

	return startServer(app, opts);
}

function startServer(app, opts) {
	const server = app.listen(opts.port);
	const result = new Promise(function (resolve, reject) {
		server.on('listening', function () {
			const url = `http://127.0.0.1:${server.address().port}/manifest.json`;
			console.log('HTTP addon accessible at:', url);
			if (process.argv.includes('--launch')) {
				const base = 'https://staging.strem.io#';
				//const base = 'https://app.strem.io/shell-v4.4#';
				const installUrl = `${base}?addonOpen=${encodeURIComponent(url)}`;
				opn(installUrl);
			}
			if (process.argv.includes('--install')) {
				opn(url.replace('http://', 'stremio://'));
			}
			resolve({
				url,
				server
			});
		});
		server.on('error', reject);
	})
	return result;
}

function serveLandingPage(addonInterface, app) {
	const landingHTML = landingTemplate(addonInterface.manifest);
	app.get('/', (_, res) => {
		res.setHeader('content-type', 'text/html');
		res.end(landingHTML);
	});
}

function serveStatic(opts, app) {
	if (opts.static) {
		const location = path.join(process.cwd(), opts.static);
		if (!fs.existsSync(location)) {
			throw new Error('directory to serve does not exist');
		}
		app.use(opts.static, express.static(location));
	}
}

function createCachedServer(addonInterface, opts) {
	if (addonInterface.constructor.name !== 'AddonInterface') {
		throw new Error('first argument must be an instance of AddonInterface');
	}

	const cacheMaxAge = opts.cacheMaxAge || opts.cache;

	if (cacheMaxAge > 365 * 24 * 60 * 60) {
		console.warn('cacheMaxAge set to more then 1 year, be advised that cache times are in seconds, not milliseconds.');
	}

	const app = express();
	app.use((_, res, next) => {
		if (cacheMaxAge && !res.getHeader('Cache-Control')) {
			res.setHeader('Cache-Control', 'max-age=' + cacheMaxAge + ', public');
		}
		next();
	})
	return app;
}

function getRouter(opts, addonInterface) {
	return opts.getRouter ? opts.getRouter(addonInterface) : getDefaultRouter(addonInterface);
}

module.exports = serveHTTP