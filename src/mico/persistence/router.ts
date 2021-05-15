import { getRouter } from 'stremio-addon-sdk';
import bodyParser from 'body-parser';
import disassemble from './controllers/movie-assembler';
import MetaDAO from './controllers/meta-dao';
import StreamDAO from './controllers/stream-dao';


export async function upsertMovieData(movie: any) {
    let metaDao = new MetaDAO();
    let streamDao = new StreamDAO();

    const {
        meta,
        streams
    } = disassemble(movie);

    await metaDao.addIfAbsent(meta);
    await streams.map((m: any) => {
        streamDao.addIfAbsent(m)
    });
}

function getProxyRouter(addonInterface: any) {
    const router = getRouter(addonInterface);

    router.use(bodyParser.json()); // to support JSON-encoded bodies
    router.use(bodyParser.urlencoded({ // to support URL-encoded bodies
        extended: true
    }));

    router.post('/movie', (req: any, res: any) => {

        upsertMovieData(req.body)
            .then(() => res.send(200))
            .catch(err => res.send(err))
    });

    return router;
}


export {
    getProxyRouter as getRouter
};