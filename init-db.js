const manifest =  require("./src/mico/persistence/models/stub/manifest.json");

br = db.getSiblingDB('brazilian-stremio-addon');
br.manifests.insert(manifest);