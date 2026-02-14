import { Box, Rectangle, Solution } from "@/models/binpacking";

function randInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
}
// get randomRate random, rest from head
function getBoxesToUnpack(boxes: Box[], n: number, randomRate?: number): Box[] {
    if (boxes.length === 0 || n <= 0) return [];
    if (randomRate == undefined || randomRate <= 0 || randomRate > 1) {
        return boxes.slice(0, n);
    }

    const numTrueBoxes = Math.floor((1 - randomRate) * n);
    const head = boxes.slice(0, numTrueBoxes); // fixed head
    const pool = boxes.slice(numTrueBoxes); // tail-only random pool

    const selected = new Map<number, Box>();
    for (const b of head) selected.set(b.id, b);

    // fill remaining slots from the tail pool
    for (let i = 0; i < n - selected.size && pool.length > 0; i++) {
        const b = pool[randInt(0, pool.length)];
        if (!selected.has(b.id)) selected.set(b.id, b);
    }

    return [...selected.values()].slice(0, n);
}

function isOverflow(rect: Rectangle, bound: number) {
    return rect.x + rect.getWidth > bound || rect.y + rect.getHeight > bound;
}

function isOverlapping(a: Rectangle, b: Rectangle): boolean {
    return !(
        a.x + a.getWidth <= b.x || // a is left of b
        b.x + b.getWidth <= a.x || // b is left of a
        a.y + a.getHeight <= b.y || // a is above b
        b.y + b.getHeight <= a.y // b is above a
    );
}

// Cheap AABB overlap check, then area
export function overlapArea(a: Rectangle, b: Rectangle): number {
    // Read local vars once to avoid property getter overhead
    const ax = a.x,
        ay = a.y,
        aw = a.getWidth,
        ah = a.getHeight;
    const bx = b.x,
        by = b.y,
        bw = b.getWidth,
        bh = b.getHeight;

    // Non-overlapping quick reject
    if (ax + aw <= bx || bx + bw <= ax || ay + ah <= by || by + bh <= ay) return 0;

    const xOverlap = Math.min(ax + aw, bx + bw) - Math.max(ax, bx);
    const yOverlap = Math.min(ay + ah, by + bh) - Math.max(ay, by);
    return xOverlap * yOverlap;
}

function calOverlapRate(a: Rectangle, b: Rectangle): number {
    const area = overlapArea(a, b);
    if (area === 0) return 0;
    const aa = a.area <= b.area ? b.area : a.area; // max(a.area, b.area) without function call
    return area / aa;
}

function countOverlaps(rect: Rectangle, box: Box): number {
    const currentRects = box.rectangles.filter((r) => r.id !== rect.id);
    const counts = currentRects.reduce((acc, r) => acc + (isOverlapping(rect, r) ? 1 : 0), 0);
    return counts;
}

function totalOverlapOfRect(rect: Rectangle, box: Box): number {
    const currentRects = box.rectangles.filter((r) => r.id !== rect.id);
    const overlap = currentRects.reduce((acc, r) => acc + calOverlapRate(rect, r), 0);
    return overlap;
}

function shuffle<Item>(array: Array<Item>): Array<Item> {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randInt(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export { isOverlapping, getBoxesToUnpack, calOverlapRate, countOverlaps, shuffle, totalOverlapOfRect, randInt };

// ------------------------------------------------------------------
// Helpers for Overlap neighborhood

function centerOf(rect: Rectangle): { cx: number; cy: number } {
    return {
        cx: rect.x + rect.getWidth / 2,
        cy: rect.y + rect.getHeight / 2,
    };
}

// define movement direction of a rectangle
function normalizeDiscrete(dx: number, dy: number): { nx: number; ny: number } {
    // Map to {-1, 0, +1} per axis
    const nx = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const ny = dy === 0 ? 0 : dy > 0 ? 1 : -1;
    return { nx, ny };
}

// move within range
function clampInt(v: number, min: number, max: number): number {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

// ------------------------------------------------------------------
// Moves for Overlap neighborhood

// GLOBAL
function moveToExistingEmptyBox(sol: Solution, rect: Rectangle): boolean {
    const boxes = [...sol.idToBox.values()];
    // add to empty box
    for (const targetBox of boxes) {
        if (targetBox.id === rect.boxId) continue;
        if (targetBox.rectangles.length == 0) {
            sol.removeRectangle(rect);
            // move to a bottom left edge
            rect.x = 0;
            rect.y = 0;
            sol.addRectangle(rect, targetBox.id);
            return true;
        }
    }
    return false;
}

function moveToNewBox(sol: Solution, rect: Rectangle): boolean {
    const newBox = sol.addNewBox();
    if (!newBox) return false;
    sol.removeRectangle(rect);
    rect.x = 0;
    rect.y = 0;
    sol.addRectangle(rect, newBox.id);
    return true;
}

function moveToBoxWithSpace(sol: Solution, rect: Rectangle, findBest: boolean): boolean {
    const boxes = shuffle<Box>([...sol.idToBox.values()]);
    let bestBoxId = null;
    let leastWaste = Infinity;

    for (const targetBox of boxes) {
        if (targetBox.id === rect.boxId) continue;
        const waste = targetBox.areaLeft - rect.area;
        if (waste >= 0) {
            if (waste < leastWaste) {
                leastWaste = waste;
                bestBoxId = targetBox.id;
                if (!findBest) break;
            }
        }
    }

    if (bestBoxId == null) return false;
    sol.removeRectangle(rect);
    sol.addRectangle(rect, bestBoxId);
    return true;
}

function moveToBoxLessOverlap(sol: Solution, rect: Rectangle, curOverlap: number, findBest: boolean): boolean {
    const boxes = [...sol.idToBox.values()].reverse();
    let bestOverlap = curOverlap;
    let bestBoxId = null;

    const oldCoords = { x: rect.x, y: rect.y, sideway: rect.isSideway };
    const edgeX = sol.L - rect.getWidth;
    const edgeY = sol.L - rect.getHeight;
    const applyCoords = (coords: { x: number; y: number }, sideway: boolean) => {
        rect.x = coords.x;
        rect.y = coords.y;
        rect.isSideway = sideway;
    };

    const coordCandidates = [
        { x: 0, y: 0 },
        { x: 0, y: edgeY },
        { x: edgeX, y: 0 },
        { x: edgeX, y: edgeY },
    ];

    for (const targetBox of boxes) {
        if (targetBox.id === rect.boxId) continue;
        if (targetBox.areaLeft >= rect.area) {
            for (const coords of coordCandidates) {
                for (const sideway of [true, false]) {
                    applyCoords(coords, sideway);
                    const overlap = totalOverlapOfRect(rect, targetBox);
                    if (overlap < bestOverlap) {
                        bestOverlap = overlap;
                        bestBoxId = targetBox.id;
                        if (!findBest || bestOverlap === 0) break;
                    }
                }
            }
        }
    }
    if (bestBoxId == null) {
        rect.x = oldCoords.x;
        rect.y = oldCoords.y;
        rect.isSideway = oldCoords.sideway;
        return false;
    }
    sol.removeRectangle(rect);
    sol.addRectangle(rect, bestBoxId);
    return true;
}

// LOCAL

function rotateRect(rect: Rectangle): void {
    const c = centerOf(rect);
    rect.isSideway = !rect.isSideway;
    rect.x = c.cx - rect.getWidth / 2;
    rect.y = c.cy - rect.getHeight / 2;
}

function tryRotateRect(box: Box, d1: Rectangle, d2: Rectangle, cur2RectsOverlap: number): null | number {
    // Apply rotation around center
    const curCount = countOverlaps(d1, box);
    rotateRect(d1);
    const newCount = countOverlaps(d1, box);
    const newOverlap = calOverlapRate(d1, d2);

    if (!isOverflow(d1, box.L) && curCount <= newCount && newOverlap <= cur2RectsOverlap) {
        return newOverlap;
    }

    rotateRect(d1); // revert to original orientation and position
    return null;
}

function swapRects(d1: Rectangle, d2: Rectangle): void {
    [d1.x, d2.x] = [d2.x, d1.x];
    [d1.y, d2.y] = [d2.y, d1.y];
}

function trySwapRects(box: Box, d1: Rectangle, d2: Rectangle, cur2RectsOverlap: number): null | number {
    swapRects(d1, d2);
    const newOverlap = calOverlapRate(d1, d2);
    if (isOverflow(d1, box.L) || isOverflow(d2, box.L) || newOverlap > cur2RectsOverlap) {
        swapRects(d1, d2);
        return null;
    }
    swapRects(d1, d2);
    return newOverlap;
}

function moveOneRect(
    box: Box,
    d1: Rectangle,
    d2: Rectangle,
    cur2RectsOverlap: number,
    findBest: boolean,
): null | { rect: Rectangle; x: number; y: number; overlap: number } {
    // move smaller first
    if (d1.area > d2.area) [d1, d2] = [d2, d1];

    const c1 = centerOf(d1);
    const c2 = centerOf(d2);

    let { nx, ny } = normalizeDiscrete(c1.cx - c2.cx, c1.cy - c2.cy);
    if (nx === 0) nx = d1.x < d2.x ? -1 : 1;
    if (ny === 0) ny = d1.y < d2.y ? -1 : 1;

    const overlapX = Math.min(d1.x + d1.getWidth, d2.x + d2.getWidth) - Math.max(d1.x, d2.x);
    const overlapY = Math.min(d1.y + d1.getHeight, d2.y + d2.getHeight) - Math.max(d1.y, d2.y);

    if (overlapX <= 0 || overlapY <= 0) return null;

    // avoid bias
    const steps = shuffle([
        { axis: "x" as const, step: overlapX, dir: nx },
        { axis: "y" as const, step: overlapY, dir: ny },
    ]);
    const rects = shuffle([d1, d2]);

    let bestPos = null;
    for (let i = 0; i < 2; i++) {
        for (const s of steps) {
            const pos = checkMove(rects[i], rects[1 - i], cur2RectsOverlap, box, s.axis, s.dir, s.step, findBest);
            if (pos && (!bestPos || pos.overlap < bestPos.overlap)) {
                bestPos = { rect: rects[i], ...pos };
                if (bestPos.overlap == 0) return bestPos;
                if (!findBest) break;
            }
        }
    }

    return bestPos;
}

function checkMove(
    r: Rectangle,
    otherRect: Rectangle,
    curOverlap: number,
    box: Box,

    axis: "x" | "y",
    dir: number,
    step: number,
    findBest: boolean,
): null | { x: number; y: number; overlap: number } {
    const oldX = r.x,
        oldY = r.y;

    const move = (sign: number) => {
        if (axis === "x") r.x = clampInt(r.x + sign * dir * step, 0, box.L - r.getWidth);
        else r.y = clampInt(r.y + sign * dir * step, 0, box.L - r.getHeight);
    };
    let bestOverlap = curOverlap;
    let bestPos = null;

    for (const m of [1, -1]) {
        move(m);
        const ol = calOverlapRate(r, otherRect);
        if (!isOverflow(r, box.L) && ol < bestOverlap) {
            bestOverlap = ol;
            bestPos = { x: r.x, y: r.y, overlap: bestOverlap };
        }
        r.x = oldX;
        r.y = oldY;
        if (!findBest && bestPos !== null) return bestPos;
    }

    return bestPos;
}

export {
    moveToExistingEmptyBox,
    moveToBoxLessOverlap,
    moveToBoxWithSpace,
    moveToNewBox,
    moveOneRect,
    trySwapRects,
    swapRects,
    tryRotateRect,
    rotateRect,
};
