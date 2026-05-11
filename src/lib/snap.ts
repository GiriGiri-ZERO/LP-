export const SNAP_THRESHOLD = 5;

interface Rect {
  id: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export function computeSnap(
  allRects: Rect[],
  movingId: string,
  movingRect: Omit<Rect, "id">,
  canvasWidth: number,
): { snappedOffsetX: number; snappedOffsetY: number; guideX?: number; guideY?: number } {
  const { offsetX, offsetY, width, height } = movingRect;
  const others = allRects.filter((r) => r.id !== movingId);

  const myPointsX = [offsetX, offsetX + width / 2, offsetX + width];
  const myPointsY = [offsetY, offsetY + height / 2, offsetY + height];

  let snappedOffsetX = offsetX;
  let snappedOffsetY = offsetY;
  let guideX: number | undefined;
  let guideY: number | undefined;
  let bestDX = SNAP_THRESHOLD + 1;
  let bestDY = SNAP_THRESHOLD + 1;

  const candidatesX = [0, canvasWidth / 2, canvasWidth];
  const candidatesY: number[] = [];

  for (const r of others) {
    candidatesX.push(r.offsetX, r.offsetX + r.width / 2, r.offsetX + r.width);
    candidatesY.push(r.offsetY, r.offsetY + r.height / 2, r.offsetY + r.height);
  }

  for (const myPt of myPointsX) {
    for (const cand of candidatesX) {
      const d = Math.abs(myPt - cand);
      if (d < bestDX) {
        bestDX = d;
        snappedOffsetX = offsetX + (cand - myPt);
        guideX = cand;
      }
    }
  }

  for (const myPt of myPointsY) {
    for (const cand of candidatesY) {
      const d = Math.abs(myPt - cand);
      if (d < bestDY) {
        bestDY = d;
        snappedOffsetY = offsetY + (cand - myPt);
        guideY = cand;
      }
    }
  }

  return {
    snappedOffsetX,
    snappedOffsetY,
    guideX: bestDX <= SNAP_THRESHOLD ? guideX : undefined,
    guideY: bestDY <= SNAP_THRESHOLD ? guideY : undefined,
  };
}
