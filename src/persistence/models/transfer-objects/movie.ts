export class MovieMeta {
    id: string
    type: string
    name?:  string
    genres?: string[]
    poster?: string
    backgorund?: string
    logo?: string
    description?: string
    releaseInfo: string
    imdbRating: number
    runtime: string
    catalogs: string[]

    constructor(releaseInfo: string, imdbRating: number, runtime: string, catalogs: string[], id: string, type: string) {
        this.releaseInfo = releaseInfo;
        this.imdbRating = imdbRating;
        this.runtime = runtime;
        this.catalogs = catalogs;
        this.id = id;
        this.type = type;
    }

}
export default class Movie {
    meta: MovieMeta
    magnets: string[]

    constructor(meta: MovieMeta, magnets: string[]) {
        this.magnets = magnets;
        this.meta = meta;
    }
}