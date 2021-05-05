const axios = require('axios')

async function getName(type, imdbId, tmdbToken = "e4e9c05e1c65b5dc20e239cae5a88b2c") {

    if (type === "movie") {
        try {
            var meta = (
                await axios.get(
                    `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbToken}&language=pt-BR&external_source=imdb_id`
                )
            ).data;
        } catch (error) {
            console.error(`The MovieDB id retrieval failed with http status ${error.response.status}`);
        }
        const resp = meta.movie_results[0];
        return resp.title
    } else {
        try {
            var meta = (
                await axios.get(
                    `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbToken}&language=pt-BR&external_source=imdb_id`
                )
            ).data;
        } catch (error) {
            console.error(`The MovieDB id retrieval failed with http status ${error.response.status}`);
        }
        const resp = meta.tv_results[0];
        return resp.name
    }
    
}

module.exports = { getName } 
