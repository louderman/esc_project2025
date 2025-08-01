type DataPoint = [number, number];

function euclideanDistance(a: DataPoint, b: DataPoint) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function haversineDistance(
  [lat1, lon1]: DataPoint,
  [lat2, lon2]: DataPoint
): number {
  const R = 6371; // Earth radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

function mean(points: DataPoint[]) {
  const n = points.length;
  const sum = points.reduce(
    (acc, val) => [acc[0] + val[0], acc[1] + val[1]],
    [0, 0]
  );
  return [sum[0] / n, sum[1] / n] as DataPoint;
}

function kMeansPlusPlusInit(data: DataPoint[], k: number) {
  if (data.length === 0) {
    return [];
  }

  const centroids: DataPoint[] = [];
  centroids.push(data[Math.floor(Math.random() * data.length)]);

  while (centroids.length < k && centroids.length < data.length) {
    const distances = data.map((point) =>
      Math.min(...centroids.map((c) => haversineDistance(point, c)))
    );
    const sum = distances.reduce((a, b) => a + b, 0);
    const probs = distances.map((d) => d / sum);

    // To prevent greedy selection (if we always select the point furthest from any centroid)
    // we can do cumulative probability sampling
    let acc = 0;
    const r = Math.random();
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (r <= acc) {
        centroids.push(data[i]);
        break;
      }
    }
    console.log('c', centroids);
    console.log('d', data);
  }
  return centroids;
}

function getFirstIndices(assignments: number[], k: number) {
  // Get first point index of each cluster
  const firstIndices = Array(k).fill(-1);
  for (let i = 0; i < assignments.length; i++) {
    const clusterId = assignments[i];
    if (firstIndices[clusterId] === -1) {
      firstIndices[clusterId] = i;
    }
  }

  return firstIndices;
}

function kMeans({
  data,
  initCentroids,
  k = 3,
  maxIter = 100,
}: {
  data: DataPoint[];
  initCentroids?: DataPoint[];
  k?: number;
  maxIter?: number;
}) {
  const centroids = initCentroids ?? kMeansPlusPlusInit(data, k);
  console.log(centroids);

  let assignments: number[] = new Array(data.length).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const distances = centroids.map((c) =>
        haversineDistance(point, c as DataPoint)
      );
      const minIdx = distances.indexOf(Math.min(...distances));
      if (assignments[i] !== minIdx) {
        assignments[i] = minIdx;
        changed = true;
      }
    }

    for (let i = 0; i < k; i++) {
      const clusterPoints = data.filter((_, j) => assignments[j] === i);
      if (clusterPoints.length > 0) {
        centroids[i] = mean(clusterPoints);
      }
    }

    if (!changed) break;
  }

  console.log('ass', assignments);
  return {
    assignments,
    centroids,
    closestIndices: getFirstIndices(assignments, k),
  };
}

export { euclideanDistance, haversineDistance, kMeans, mean };
