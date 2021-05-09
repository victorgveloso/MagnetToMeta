const {
  OTHER_QUALITIES,
  CAM_QUALITIES,
  HEALTHY_SEEDERS,
  SEEDED_SEEDERS,
  MIN_HEALTHY_COUNT,
  MAX_UNHEALTHY_COUNT
} = require('./config');


const SortOptions = {
  key: 'sort',
  options: {
    qualitySeeders: {
      key: 'quality',
      description: 'By quality then seeders'
    },
    qualitySize: {
      key: 'qualitysize',
      description: 'By quality then size'
    },
    seeders: {
      key: 'seeders',
      description: 'By seeders'
    },
    size: {
      key: 'size',
      description: 'By size'
    },
  }
}

function sortStreams(streams, config) {
  const sort = config.sort && config.sort.toLowerCase() || undefined;
  if (sort === SortOptions.options.seeders.key) {
    return sortBySeeders(streams);
  } else if (sort === SortOptions.options.size.key) {
    return sortBySize(streams);
  }
  const nestedSort = sort === SortOptions.options.qualitySize.key ? sortBySize : noopSort;
  return sortByVideoQuality(streams, nestedSort)
}

function noopSort(streams) {
  return streams;
}

function sortBySeeders(streams) {
  // streams are already presorted by seeders and upload date
  const healthy = streams.filter(stream => extractSeeders(stream.title) >= HEALTHY_SEEDERS);
  const seeded = streams.filter(stream => extractSeeders(stream.title) >= SEEDED_SEEDERS);

  if (healthy.length >= MIN_HEALTHY_COUNT) {
    return healthy;
  } else if (seeded.length >= MAX_UNHEALTHY_COUNT) {
    return seeded.slice(0, MIN_HEALTHY_COUNT);
  }
  return streams.slice(0, MAX_UNHEALTHY_COUNT);
}

function sortBySize(streams) {
  return sortBySeeders(streams)
    .sort((a, b) => {
      const aSize = extractSize(a.title);
      const bSize = extractSize(b.title);
      return bSize - aSize;
    });
}

function sortByVideoQuality(streams, nestedSort) {
  const qualityMap = sortBySeeders(streams)
    .reduce((map, stream) => {
      const quality = extractQuality(stream.name);
      map[quality] = (map[quality] || []).concat(stream);
      return map;
    }, {});
  const sortedQualities = Object.keys(qualityMap)
    .sort((a, b) => {
      const aResolution = a && a.match(/\d+p/) && parseInt(a, 10);
      const bResolution = b && b.match(/\d+p/) && parseInt(b, 10);
      if (aResolution && bResolution) {
        return bResolution - aResolution; // higher resolution first;
      } else if (aResolution) {
        return -1; // remain higher if resolution is there
      } else if (bResolution) {
        return 1; // move downward if other stream has resolution
      }
      return a < b ? -1 : b < a ? 1 : 0; // otherwise sort by alphabetic order
    });
  return sortedQualities
    .map(quality => nestedSort(qualityMap[quality]))
    .reduce((a, b) => a.concat(b), []);
}

function extractQuality(title) {
  const qualityDesc = title.split('\n')[1];
  const resolutionMatch = qualityDesc && qualityDesc.match(/\d+p/);
  if (resolutionMatch) {
    return resolutionMatch[0];
  } else if (/8k/i.test(qualityDesc)) {
    return '4320p'
  } else if (/4k|uhd/i.test(qualityDesc)) {
    return '2060p'
  } else if (CAM_QUALITIES.test(qualityDesc)) {
    return CAM_QUALITIES.label;
  } else if (OTHER_QUALITIES.test(qualityDesc)) {
    return OTHER_QUALITIES.label;
  }
  return qualityDesc;
}

function extractSeeders(title) {
  const seedersMatch = title.match(/👤 (\d+)/);
  return seedersMatch && parseInt(seedersMatch[1]) || 0;
}

function extractSize(title) {
  const seedersMatch = title.match(/💾 ([\d.]+ \w+)/);
  return seedersMatch && parseSize(seedersMatch[1]) || 0;
}

function parseSize(sizeText) {
  if (!sizeText) {
    return 0;
  }
  let scale = 1;
  if (sizeText.includes('TB')) {
    scale = 1024 * 1024 * 1024 * 1024
  } else if (sizeText.includes('GB')) {
    scale = 1024 * 1024 * 1024
  } else if (sizeText.includes('MB')) {
    scale = 1024 * 1024;
  } else if (sizeText.includes('kB')) {
    scale = 1024;
  }
  return Math.floor(parseFloat(sizeText.replace(/,/g, '')) * scale);
}

module.exports = sortStreams;
module.exports.SortOptions = SortOptions;