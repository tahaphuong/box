import { Box } from "@/models/binpacking";

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
        const b = pool[Math.floor(Math.random() * pool.length)];
        if (!selected.has(b.id)) selected.set(b.id, b);
    }

    return [...selected.values()].slice(0, n);
}
