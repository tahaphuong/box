import { Box, Rectangle } from "@/models/binpacking";

export function randInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
}
// get randomRate random, rest from head
export function getBoxesToUnpack(
    boxes: Box[],
    n: number,
    randomRate?: number,
): Box[] {
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

export function calOverlapRate(a: Rectangle, b: Rectangle): number {
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

export function shuffle<Item>(array: Array<Item>): Array<Item> {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randInt(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function centerOf(rect: Rectangle): { cx: number; cy: number } {
    return {
        cx: rect.x + rect.getWidth / 2,
        cy: rect.y + rect.getHeight / 2,
    };
}

// Normalize a 2D vector (dx, dy) to unit length.
// Returns { nx, ny } = (dx, dy) / ||(dx,dy)||. If magnitude is 0, returns (0,0).
export function normalizeDiscrete(
    dx: number,
    dy: number,
): { nx: number; ny: number } {
    // Map to {-1, 0, +1} per axis
    const nx = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const ny = dy === 0 ? 0 : dy > 0 ? 1 : -1;
    return { nx, ny };
}

// Integer clamp remains the same, it works for ints too
export function clampInt(v: number, min: number, max: number): number {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}

export function isOverflow(rect: Rectangle, bound: number) {
    return rect.x + rect.getWidth >= bound || rect.y + rect.getHeight >= bound;
}
