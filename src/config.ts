import mongoose from 'mongoose';
import Providers from "./persistence/models/stub/providers.json";
import QualityFilter from "./persistence/models/stub/quality";

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
export const SCRAPER_API_HOST = process.env.SCRAPER_API_HOST || "https://api-siteplaceholder.herokuapp.com";
export const UNKNOWN_SIZE = 300000000;

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

export function setupConfig() {
	const config: any = {};
	config[Providers.key] = Providers.options.filter((provider: any) => !provider.foreign).map((provider: any) => provider.key);
	config[QualityFilter.key] = ['scr', 'cam'];
	config['lite'] = true;
	return config;
}

export { QualityFilter, Providers };