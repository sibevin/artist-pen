type DistributionKey = string;
type DistributionMap = Record<DistributionKey, number>;

export function addKey(
  key: DistributionKey,
  map?: DistributionMap
): DistributionMap {
  let dMap = map;
  if (!dMap) {
    dMap = {};
  }
  if (dMap[key]) {
    dMap[key] += 1;
  } else {
    dMap[key] = 1;
  }
  return dMap;
}

export function deleteKey(
  key: DistributionKey,
  map?: DistributionMap
): DistributionMap {
  if (!map) {
    return {};
  }
  if (map[key]) {
    map[key] -= 1;
    if (map[key] <= 0) {
      delete map[key];
    }
  }
  return map;
}

export function listKeys(map?: DistributionMap): DistributionKey[] {
  if (map) {
    return Object.keys(map).sort();
  }
  return [];
}
