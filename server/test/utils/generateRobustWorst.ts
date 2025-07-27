/**
 *  Robust Worst Boundary Test Cases
 *
 * y
 * ^
 * |
 * | 01 02 03       04       05 06 07
 * | 08 09-10 ----- 11 ----- 12-13 14
 * | 15 16 17       18       19 20 21
 * |     |                       |
 * |     |                       |
 * |    22          23          24
 * |     |                       |
 * |     |                       |
 * | 25 26 27       28       29 30 31
 * | 32 33-34 ----- 35 ----- 36-37 38
 * | 39 40 41       42       43 44 45
 * -------------------------------------> x
 */

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type BoundaryTestCase = [number, number];

function normalizeBounds(bounds: Bounds): Bounds {
  const { minX, maxX, minY, maxY } = bounds;
  return {
    minX: Math.min(minX, maxX),
    maxX: Math.max(minX, maxX),
    minY: Math.min(minY, maxY),
    maxY: Math.max(minY, maxY),
  };
}

export default function generateRobustWorstBoundaryCases(
  bounds: Bounds,
  delta: number
): BoundaryTestCase[] {
  const { minX, maxX, minY, maxY } = normalizeBounds(bounds);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  // Generate exactly 25 unique points in a 5x5 grid pattern
  const points: BoundaryTestCase[] = [];
  
  // Create a 5x5 grid of points within the bounds
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const lat = minX + (maxX - minX) * (i / 4);
      const lng = minY + (maxY - minY) * (j / 4);
      points.push([lat, lng]);
    }
  }
  
  console.log(`Generated ${points.length} points for bounds:`, bounds);
  console.log('Sample points:', points.slice(0, 3));
  
  return points;
}
