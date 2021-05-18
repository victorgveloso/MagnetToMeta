import {
    connection
} from 'mongoose';
import {
    PORT,
    connect
} from './config';
import ManifestDAO from './persistence/controllers/manifest-dao';

import {
    getRouter
} from './router';
import {
    HttpServer
} from './HttpServer';
import {
    addonBuilder
} from 'stremio-addon-sdk';

import {
    createCatalogHandler,
    createStreamHandler,
    createSeriesStreamHandler
} from './addon';

import DefaultManifest from './persistence/models/stub/manifest.json';

connect().then((mongo_uri) => {
    console.log(`MONGO URI: ${mongo_uri}`);
}).catch(console.error);

connection.once('open', () => {
    let manifestDao = new ManifestDAO()
    manifestDao.get()
        .then((manifest) => {
            init(manifest);
        })
        .catch((error) => {
            console.error("[Warning] Something went wrong!");
            console.error(error);
            console.error("[Warning] Falling back to default manifest");
            init(new DefaultManifest());
        });
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

function createJointStreamHandler(args) {
    if(args.type === "movie") {
        return createStreamHandler(args);
    }
    else if (args.type === "series") {
        return createSeriesStreamHandler(args);
    }
    else {
        throw Error(`Unsupported Stream format ${args.type}`);
    }
}

function setupAddonInterface(manifest) {
    const builder = new addonBuilder(manifest.toObject());
    builder.defineStreamHandler(createJointStreamHandler);
    builder.defineCatalogHandler(createCatalogHandler);
    return builder.getInterface();
}