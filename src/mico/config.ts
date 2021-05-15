import mongoose from 'mongoose';
import Providers from "../providers.json";
import QualityFilter from "../quality";

// TODO: export and identify where filters should be used
// function applyFilters(streams: Array<any>, config: any) {
//     return filterByQuality(filterByProvider(streams, config), config);
// }

// function filterByProvider(streams: Array<any>, config: any) {
//     const defaultProviderKeys = Providers.options.map(provider => provider.key);
//     const providers = config.providers || defaultProviderKeys;
//     if (!providers || !providers.length) {
//         return streams;
//     }
//     return streams.filter(stream => {
//         const match = stream.title.match(/⚙.* ([^ \n]+)/);
//         const provider = match && match[1].toLowerCase();
//         return providers.includes(provider);
//     })
// }

// function filterByQuality(streams: Array<any>, config: any) {
//     const filters = config[QualityFilter.key];
//     if (!filters) {
//         return streams;
//     }
//     const filterOptions = QualityFilter.options.filter(option => filters.includes(option.key));
//     return streams.filter(stream => {
//         const streamQuality = stream.name.split('\n')[1];
//         return !filterOptions.some(option => option.test(streamQuality));
//     });
// }

export const OTHER_QUALITIES = QualityFilter.options.find(option => option.key === 'other'),
    CAM_QUALITIES = QualityFilter.options.find(option => option.key === 'cam'),
    HEALTHY_SEEDERS = 5,
    SEEDED_SEEDERS = 1,
    MIN_HEALTHY_COUNT = 10,
    MAX_UNHEALTHY_COUNT = 5;

export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = process.env.DB_PORT || 27017;
export const DB_NAME = process.env.DB_NAME || "brazilian-addon-db";
const DB_USER = process.env.DB_USER;
const DB_PSK = process.env.DB_PSK;

export async function connect() {
    let CREDENTIALS = "";
    if (DB_USER && DB_PSK) CREDENTIALS = `${DB_USER}:${DB_PSK}@`;
    let mongouri = `mongodb+srv://${CREDENTIALS}${DB_HOST}:/${DB_NAME}`;
    try {
        await mongoose.connect(mongouri);
    } catch (err) {
        mongouri = `mongodb://${CREDENTIALS}${DB_HOST}:${DB_PORT}/${DB_NAME}`;
        try {
            await mongoose.connect(mongouri);
        } catch (err) {
            throw new Error(`Could not connect to db 'mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}': ${err}`);
        }
    }
    return mongouri;
}