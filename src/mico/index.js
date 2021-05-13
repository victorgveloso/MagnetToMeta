var mongoose = require('mongoose')
const {
    PORT
} = require('./config')
const ManifestDAO = require('./persistence/controllers/manifest-dao');

const {
    getRouter
} = require('./persistence/router');
const {
    HttpServer
} = require('./HttpServer');
const {
    addonBuilder,
    // publishToCentral
} = require('stremio-addon-sdk');

const {
    createCatalogHandler,
    createStreamHandler
} = require('./addon');

mongoose.connection.once('open', () => {
    let manifestDao = new ManifestDAO()
    manifestDao.get()
        .then((manifest) => {
            init(manifest);
        })
        .catch((error) => {
            console.error("Something went wrong!");
            console.error(error);
        })
});

function init(manifest) {
    new HttpServer(setupAddonInterface(manifest), {
        port: PORT,
        getRouter
    }).serve().then(({
        url
    }) => {
        console.log(`Listening on ${url}`);
        // publishToCentral('https://stremio-brazilian-addon.herokuapp.com/manifest.json');
    }).catch((error) => {
        console.error("Couldn't start http server!");
        console.error(error);
    });
}
function setupAddonInterface(manifest) {
    const builder = new addonBuilder(manifest.toObject());
    builder.defineStreamHandler(createStreamHandler);
    builder.defineCatalogHandler(createCatalogHandler);
    return builder.getInterface();
}

