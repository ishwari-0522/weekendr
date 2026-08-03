'use client';

/**
 * Timeline Sync: Maps indices to building and nature object IDs.
 */
export function getSpotDetails(index, config) {
  if (!config) return null;

  // Ordered list of stop locations based on building config ids
  const spotsList = [];

  // 1. Collect Bookstore
  const bookstore = config.buildings?.find((b) => b.id === 'bookstore');
  if (bookstore) spotsList.push(bookstore);

  // 2. Collect Cafe
  const cafe = config.buildings?.find((b) => b.id === 'cafe');
  if (cafe) spotsList.push(cafe);

  // 3. Collect Fountain/Pond
  const fountain = config.nature?.find((n) => n.type === 'pond');
  if (fountain) spotsList.push(fountain);

  if (index >= 0 && index < spotsList.length) {
    return spotsList[index];
  }

  // Fallback to coordinates from paths
  if (config.paths && index >= 0 && index < config.paths.length) {
    const p = config.paths[index];
    return { id: p.id, name: 'Outing Stop', x: p.fromX, y: p.fromY };
  }

  return null;
}

export default {
  getSpotDetails
};
