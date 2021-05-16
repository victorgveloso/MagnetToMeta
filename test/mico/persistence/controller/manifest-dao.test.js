var mongoose = require('mongoose');
const CatalogDAO = require('../../../../src/mico/persistence/controllers/catalog-dao');
const ManifestDAO = require('../../../../src/mico/persistence/controllers/manifest-dao');
const Manifest = require('../../../../src/mico/persistence/models/manifest');
const Catalog = require('../../../../src/mico/persistence/models/catalog');
const catalogStub = require('../../../../src/mico/persistence/models/stub/catalog.json');
var manifestStub, catalog, origManifest, catalogDao, manifestDao;

jest.retryTimes(5);

beforeAll(async () => {
    let {
        connect
    } = require('../../../../src/mico/config');
    await connect();
    catalogDao = new CatalogDAO();
    manifestDao = new ManifestDAO();

    try {
        origManifest = await manifestDao.get();
    } catch (error) {
        origManifest = require("../../../../src/mico/persistence/models/stub/manifest.json");
    } 
    finally {
        await Manifest.deleteMany({}).exec();
        await Catalog.deleteMany({}).exec();
    }

});
afterAll(async () => {
    console.log(origManifest);
    try {
        await manifestDao.add(origManifest || manifestStub);
    } catch(error) { /* Do nothing. */}

    await mongoose.disconnect();
});
beforeEach(async () => {
    catalog = await catalogDao.add(catalogStub);

    manifestStub = {
        id: "brazilian-addon",
        name: "Brazilian Addon",
        version: "0.0.1",
        description: "Stremio addon for dubbed movies in portuguese (brazil).",
        resources: ["catalog", "stream"],
        types: ["movie"],
        catalogs: [catalog.toObject()],
        idPrefixes: ["tt"]
    };

});
afterEach(async () => {
    await Manifest.deleteMany({}).exec();
    await Catalog.deleteMany({}).exec();
});

describe('When a manifest is added to db', () => {
    var manifest;
    beforeEach(async () => {
        m = await manifestDao.add(manifestStub);

        manifest = await manifestDao.get();

    });
    it('should be returned by manifestDao.get', async () => {

        expect(manifest).toMatchObject({
            ...manifestStub,
            $__: expect.any(Object),
            catalogs: expect.any(Array),
            idPrefixes: expect.any(Array),
            resources: expect.any(Array),
            types: expect.any(Array)
        });
    });
    it('should contain catalog in catalogs list', async () => {
        expect(manifest.catalogs).toEqual(expect.arrayContaining([expect.objectContaining({
            id: catalogStub.id
        })]));
    });
    it('should have a complete catalogs property', async () => {
        for (const prop in catalogStub) {
            expect(manifest.catalogs[0]).toHaveProperty(prop);
        }
    });
});