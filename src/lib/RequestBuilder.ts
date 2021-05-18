export class RequestBuilder {
    host: string;
    version: string;
    encoded: boolean;
    _tmdbToken: string;
    _url?: string = undefined;
    _query?: string = undefined;
    _imdbId?: string = undefined;

    constructor(host: string, url?: string, query?: string, imdbId?: string, version = "v1", encoded = false, tmdbToken = "e4e9c05e1c65b5dc20e239cae5a88b2c") {
        this.host = host;
        this._url = url;
        this._query = query;
        this._imdbId = imdbId;
        this.version = version;
        this.encoded = encoded;
        this._tmdbToken = tmdbToken;
    }

    private clone() {
        return new RequestBuilder(this.host, this._url, this._query, this._imdbId, this.version, this.encoded, this._tmdbToken);
    }

    url(url: string): RequestBuilder {
        let result = this.clone();
        result._url = url;
        return result;
    }
    imdbId(id: string): RequestBuilder {
        let result = this.clone();
        result._imdbId = id;
        return result;
    }
    tmdbToken(token: string): RequestBuilder {
        let result = this.clone();
        result._tmdbToken = token;
        return result;
    }
    buildTmdbId(): string {
        if (this._imdbId === undefined) {
            throw new Error("imdbId must be defined");
        }
        return `https://api.themoviedb.org/3/find/${this._imdbId}?api_key=${this._tmdbToken}&language=pt-BR&external_source=imdb_id`;
    }
    buildDetail(): string {
        if (this._url === undefined) {
            throw new Error("url must be defined");
        }
        return `${this.host}/${this.version}/magnet-source/detail?url=${this._url}&encoded=${this.encoded}`;
    }
    query(query: string): RequestBuilder {
        let result = this.clone();
        result._query = query;
        return result;
    }
    buildSearch(): string {
        if (this._url === undefined || this._query === undefined) {
            throw new Error("url and query must be defined");
        }
        return `${this.host}/${this.version}/magnet-source/search?url=${this._url}&search_query=${this._query}&encoded=${this.encoded}`;
    }
}
