
import Providers from "./providers.json";
import QualityFilter from "./quality";

const defaultProviderKeys = Providers.options.map(provider => provider.key);

function applyFilters(streams, config) {
  return filterByQuality(filterByProvider(streams, config), config);
}

function filterByProvider(streams, config) {
  const providers = config.providers || defaultProviderKeys;
  if (!providers || !providers.length) {
    return streams;
  }
  return streams.filter(stream => {
    const match = stream.title.match(/⚙.* ([^ \n]+)/);
    const provider = match && match[1].toLowerCase();
    return providers.includes(provider);
  })
}

function filterByQuality(streams, config) {
  const filters = config[QualityFilter.key];
  if (!filters) {
    return streams;
  }
  const filterOptions = QualityFilter.options.filter(option => filters.includes(option.key));
  return streams.filter(stream => {
    const streamQuality = stream.name.split('\n')[1];
    return !filterOptions.some(option => option.test(streamQuality));
  });
}

const OTHER_QUALITIES = QualityFilter.options.find(option => option.key === 'other');
const CAM_QUALITIES = QualityFilter.options.find(option => option.key === 'cam');
const HEALTHY_SEEDERS = 5,
  SEEDED_SEEDERS = 1,
  MIN_HEALTHY_COUNT = 10,
  MAX_UNHEALTHY_COUNT = 5;
module.exports = {
  ...applyFilters,
  Providers,
  QualityFilter,
  OTHER_QUALITIES,
  CAM_QUALITIES,
  HEALTHY_SEEDERS,
  SEEDED_SEEDERS,
  MIN_HEALTHY_COUNT,
  MAX_UNHEALTHY_COUNT
};