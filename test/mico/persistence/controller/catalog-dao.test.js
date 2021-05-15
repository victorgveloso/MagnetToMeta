var mongoose = require('mongoose');
const CatalogDAO = require('../../../../src/mico/persistence/controllers/catalog-dao');
const Catalog = require('../../../../src/mico/persistence/models/catalog');
var catalogStub = {
    type: "movie",
    id: "BrazilianCatalog",
    name: "Filmes Dublados (ptbr)",
    genres: ["Ação", "Animação", "Aventura", "Clássico", "Comédia", "Documentário", "Drama", "Fantasia", "Ficção", "Faroeste", "Guerra", "Músicas", "Nacional", "Policial", "Romance", "Suspense", "Terror"],
    extraSupported: ["search", "genre"],
};
var catalogDao, catalog;

jest.retryTimes(5);

beforeAll(async () => {
    let {
        connect
    } = require('../../../../src/mico/config');
    await connect();
    catalogDao = new CatalogDAO();
});
afterAll(async () => {
    await mongoose.disconnect();
});
beforeEach(async () => {
    catalog = await catalogDao.add(catalogStub);
});
afterEach(async () => {
    await Catalog.deleteMany().exec();
});

it('Should save the object with new properties (_id and __v)', async () => {
    expect(catalog).toEqual(expect.objectContaining({
        '_id': expect.anything(),
        '__v': expect.anything(),
    }));
    expect(catalog.id).toEqual(catalogStub.id);
});

it('Should have only added value', async () => {
    var catalogs = await catalogDao.getAll();
    expect(catalogs).toHaveLength(1);
});
it('Should have more values if added later', async () => {
    await catalogDao.add(catalogStub);

    catalogs = await catalogDao.getAll();
    expect(catalogs).toHaveLength(2);
});
it('Should have correct genres definitions', () => {
    expect(catalog.genres).toContain("Aventura");
    expect(catalog.genres).toContain("Guerra");
});
it('Should have correct extra supported definitions', () => {
    expect(catalog.extraSupported).toContain("search");
    expect(catalog.extraSupported).toContain("genre");
});