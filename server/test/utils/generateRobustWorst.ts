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

  const getCorner = (cx: number, cy: number): BoundaryTestCase[] => {
    return [
      // first row
      [cx - delta, cy - delta],
      [cx, cy - delta],
      [cx + delta, cy - delta],
      // second row
      [cx - delta, cy],
      [cx, cy],
      [cx + delta, cy],
      // third row
      [cx - delta, cy + delta],
      [cx, cy + delta],
      [cx + delta, cy + delta],
    ];
  };

  const getBorder = (
    cx: number,
    cy: number,
    horizontalBorder: boolean
  ): BoundaryTestCase[] => {
    if (horizontalBorder) {
      return [
        [cx, cy - delta],
        [cx, cy],
        [cx, cy + delta],
      ];
    } else {
      return [
        [cx - delta, cy],
        [cx, cy],
        [cx + delta, cy],
      ];
    }
  };

  return [
    ...getCorner(minX, maxY), // top left
    ...getCorner(maxX, maxY), // top right
    ...getCorner(minX, minY), // bottom left
    ...getCorner(maxX, minY), // bottom right
    [midX, midY], // center
    ...getBorder(midX, maxY, true), // top edge
    ...getBorder(maxX, midY, false), // right edge
    ...getBorder(midX, minY, true), // down edge
    ...getBorder(minX, midY, false), // left edge
  ];
}
