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

            const builder = new addonBuilder(manifest.toObject());
            builder.defineStreamHandler(createStreamHandler);
            builder.defineCatalogHandler(createCatalogHandler);

            // publishToCentral('https://stremio-brazilian-addon.herokuapp.com/manifest.json');

            return new HttpServer(builder.getInterface(), {
                port: PORT,
                getRouter
            }).serve().then(({
                url
            }) => {
                console.log(`Listening on ${url}`);
            }).catch((error) => {
                console.error("Couldn't start http server!");
                console.error(error);
            });
        })
        .catch((error) => {
            console.error("Something went wrong!");
            console.error(error);
        })
});