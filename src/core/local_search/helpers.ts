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
    return rect.x + rect.getWidth >= bound || rect.y + rect.getHeight >= bound;
}

function isOverlapping(a: Rectangle, b: Rectangle): boolean {
    return !(
        a.x + a.getWidth <= b.x || // a is left of b
        b.x + b.getWidth <= a.x || // b is left of a
        a.y + a.getHeight <= b.y || // a is above b
        b.y + b.getHeight <= a.y // b is above a
    );
}

function calOverlapRate(a: Rectangle, b: Rectangle): number {
    const xOverlap = Math.max(
        0,
        Math.min(a.x + a.getWidth, b.x + b.getWidth) - Math.max(a.x, b.x),
    );
    const yOverlap = Math.max(
        0,
        Math.min(a.y + a.getHeight, b.y + b.getHeight) - Math.max(a.y, b.y),
    );
    const overlapArea = xOverlap * yOverlap;
    return overlapArea / Math.max(a.area, b.area);
}

function shuffle<Item>(array: Array<Item>): Array<Item> {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randInt(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export {
    randInt,
    getBoxesToUnpack,
    isOverflow,
    isOverlapping,
    calOverlapRate,
    shuffle,
};

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

function moveToExistingEmptyBox(sol: Solution, rect: Rectangle): boolean {
    const boxes = shuffle<Box>([...sol.idToBox.values()]);
    // add to empty box
    for (const targetBox of boxes) {
        if (targetBox.id === rect.boxId) continue;
        if (targetBox.rectangles.length == 0) {
            sol.removeRectangle(rect);
            // move to a random edge
            rect.x = Math.random() < 0.5 ? sol.L - rect.getWidth : 0;
            rect.y = Math.random() < 0.5 ? sol.L - rect.getHeight : 0;
            sol.addRectangle(rect, targetBox.id);
            return true;
        }
    }
    return false;
}

function moveToBoxWithSpace(sol: Solution, rect: Rectangle): boolean {
    const boxes = shuffle<Box>([...sol.idToBox.values()]);
    for (const targetBox of boxes) {
        if (targetBox.id === rect.boxId) continue;
        if (targetBox && targetBox.areaLeft >= rect.area) {
            sol.removeRectangle(rect);
            // move to a random edge
            rect.x = Math.random() < 0.5 ? sol.L - rect.getWidth : 0;
            rect.y = Math.random() < 0.5 ? sol.L - rect.getHeight : 0;
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
    // move to a random edge
    rect.x = Math.random() < 0.5 ? sol.L - rect.getWidth : 0;
    rect.y = Math.random() < 0.5 ? sol.L - rect.getHeight : 0;
    sol.addRectangle(rect, newBox.id);
    return true;
}

function moveToRandomBox(sol: Solution, rect: Rectangle): boolean {
    const boxes = [...sol.idToBox.values()];
    const targetBox =
        boxes[Math.min(randInt(0, boxes.length), boxes.length - 1)];
    if (!targetBox || targetBox.id === rect.boxId) return false;

    sol.removeRectangle(rect);
    // move to a random edge
    rect.x = Math.random() < 0.5 ? sol.L - rect.getWidth : 0;
    rect.y = Math.random() < 0.5 ? sol.L - rect.getHeight : 0;
    sol.addRectangle(rect, targetBox.id);
    return true;
}

function rotateRect(L: number, rect: Rectangle): boolean {
    rect.isSideway = !rect.isSideway;

    // check bound
    if (isOverflow(rect, L)) {
        rect.isSideway = !rect.isSideway;
        return false;
    }
    return true;
}

function swapRects(L: number, d1: Rectangle, d2: Rectangle): boolean {
    [d1.x, d2.x] = [d2.x, d1.x];
    [d1.y, d2.y] = [d2.y, d1.y];

    if (isOverflow(d1, L) || isOverflow(d2, L)) {
        [d1.x, d2.x] = [d2.x, d1.x];
        [d1.y, d2.y] = [d2.y, d1.y];
        return false;
    }
    return true;
}

function moveTwoRects(L: number, d1: Rectangle, d2: Rectangle): boolean {
    const c1 = centerOf(d1);
    const c2 = centerOf(d2);

    // discrete push direction from centers
    let { nx, ny } = normalizeDiscrete(c1.cx - c2.cx, c1.cy - c2.cy);
    if (nx === 0) nx = d1.x < d2.x ? -1 : 1;
    if (ny === 0) ny = d1.y < d2.y ? -1 : 1;

    // compute overlap along each axis
    const overlapX =
        Math.min(d1.x + d1.getWidth, d2.x + d2.getWidth) - Math.max(d1.x, d2.x);
    const overlapY =
        Math.min(d1.y + d1.getHeight, d2.y + d2.getHeight) -
        Math.max(d1.y, d2.y);

    // no overlap at all
    if (overlapX <= 0 && overlapY <= 0) return false;

    // determine axis to push: smaller overlap first, random if equal
    let pushAxis: "x" | "y";
    if (overlapX < overlapY) pushAxis = "x";
    else if (overlapY < overlapX) pushAxis = "y";
    else pushAxis = Math.random() < 0.5 ? "x" : "y"; // tie-break randomly

    const nxPush = pushAxis === "x" ? nx : 0;
    const nyPush = pushAxis === "y" ? ny : 0;
    const step = pushAxis === "x" ? overlapX : overlapY;

    // remember old positions
    const oldD1 = { x: d1.x, y: d1.y };
    const oldD2 = { x: d2.x, y: d2.y };

    // move d1 along the chosen axis
    if (pushAxis === "x")
        d1.x = clampInt(d1.x + nxPush * step, 0, L - d1.getWidth);
    if (pushAxis === "y")
        d1.y = clampInt(d1.y + nyPush * step, 0, L - d1.getHeight);

    // check if overlap still exists
    const stillOverlap =
        Math.min(d1.x + d1.getWidth, d2.x + d2.getWidth) -
            Math.max(d1.x, d2.x) >
            0 &&
        Math.min(d1.y + d1.getHeight, d2.y + d2.getHeight) -
            Math.max(d1.y, d2.y) >
            0;

    // move d2 along the same axis if needed
    if (stillOverlap) {
        const remainingStep =
            step -
            (pushAxis === "x"
                ? Math.abs(d1.x - oldD1.x)
                : Math.abs(d1.y - oldD1.y));

        if (pushAxis === "x")
            d2.x = clampInt(d2.x - nxPush * remainingStep, 0, L - d2.getWidth);
        if (pushAxis === "y")
            d2.y = clampInt(d2.y - nyPush * remainingStep, 0, L - d2.getHeight);
    }

    // return true if either rectangle moved
    const movedD1 = d1.x !== oldD1.x || d1.y !== oldD1.y;
    const movedD2 = d2.x !== oldD2.x || d2.y !== oldD2.y;
    return movedD1 || movedD2;
}

function pushTwoRects(L: number, d1: Rectangle, d2: Rectangle): boolean {
    const c1 = centerOf(d1);
    const c2 = centerOf(d2);

    let { nx, ny } = normalizeDiscrete(c1.cx - c2.cx, c1.cy - c2.cy);

    if (nx === 0) nx = d1.x < d2.x ? -1 : 1;
    if (ny === 0) ny = d1.y < d2.y ? -1 : 1;

    // compute overlap along each axis
    const overlapX =
        Math.min(d1.x + d1.getWidth, d2.x + d2.getWidth) - Math.max(d1.x, d2.x);
    const overlapY =
        Math.min(d1.y + d1.getHeight, d2.y + d2.getHeight) -
        Math.max(d1.y, d2.y);

    if (overlapX <= 0 && overlapY <= 0) return false; // safety check

    // push d1 first
    const oldD1X = d1.x;
    const oldD1Y = d1.y;
    if (overlapX > 0) d1.x = clampInt(d1.x + nx * overlapX, 0, L - d1.getWidth);
    if (overlapY > 0)
        d1.y = clampInt(d1.y + ny * overlapY, 0, L - d1.getHeight);

    const movedD1 = d1.x !== oldD1X || d1.y !== oldD1Y;

    // push d2 if still overlapping
    const remainingX = overlapX > 0 ? overlapX - Math.abs(d1.x - oldD1X) : 0;
    const remainingY = overlapY > 0 ? overlapY - Math.abs(d1.y - oldD1Y) : 0;
    if (remainingX > 0)
        d2.x = clampInt(d2.x - nx * remainingX, 0, L - d2.getWidth);
    if (remainingY > 0)
        d2.y = clampInt(d2.y - ny * remainingY, 0, L - d2.getHeight);

    const movedD2 = d2.x !== oldD1X || d2.y !== oldD1Y;

    return movedD1 || movedD2;
}

export {
    moveToExistingEmptyBox,
    moveToBoxWithSpace,
    moveToRandomBox,
    moveToNewBox,
    moveTwoRects,
    pushTwoRects,
    swapRects,
    rotateRect,
};
