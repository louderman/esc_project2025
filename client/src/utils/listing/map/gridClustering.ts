function distanceInPx(
  coord1: [number, number],
  coord2: [number, number],
  map: google.maps.Map
) {
  const projection = map.getProjection();
  const zoom = map.getZoom();
  if (!projection || typeof zoom !== 'number') return 0;

  const p1 = projection.fromLatLngToPoint(
    new google.maps.LatLng(coord1[0], coord1[1])
  );
  const p2 = projection.fromLatLngToPoint(
    new google.maps.LatLng(coord2[0], coord2[1])
  );

  const pixelSize = Math.pow(2, zoom);

  return Math.sqrt((p1!.x - p2!.x) ** 2 + (p1!.y - p2!.y) ** 2) * pixelSize;
}

type Point = [number, number];
/**
 * Groups points that are close to each other based on pixel distance on the map,
 * and returns the indices of representative points (first point in each cluster).
 *
 * @param points - Array of [lat, lng] points
 * @param map - Google Maps instance
 * @param pixelThreshold - Maximum pixel distance to consider points as close
 * @returns Array of indices representing one point per cluster
 */
function mergeClosePoints(
  points: Point[],
  map: google.maps.Map,
  pixelThreshold: number
) {
  const visited = new Set<number>();
  const representativeIndices: number[] = [];
  const zoom = map.getZoom();
  if (!zoom) return [];

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;

    visited.add(i);
    const clusterGroup: number[] = [i];

    for (let j = i + 1; j < points.length; j++) {
      if (visited.has(j)) continue;

      const dist = distanceInPx(
        [points[i][0], points[i][1]],
        [points[j][0], points[j][1]],
        map
      );

      if (dist < pixelThreshold) {
        clusterGroup.push(j);
        visited.add(j);
      }
    }

    representativeIndices.push(clusterGroup[0]);
  }

  return representativeIndices;
}

export { mergeClosePoints };
