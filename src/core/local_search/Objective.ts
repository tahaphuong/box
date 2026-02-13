import type { AlgoSolution } from "@/models";
import type { Solution } from "@/models/binpacking";
import { calOverlapRate } from "@/core/local_search/helpers";
import type { Stats } from "./Stats";

export interface ObjectiveFunction<SOL extends AlgoSolution> {
    score(sol: SOL): number;
    isBetterScore(a: number, b: number): boolean; // better score can be larger/smaller
    update(stats: Stats): void;
}

// Goal: Maximize
export class UltilizationBox implements ObjectiveFunction<Solution> {
    update(_stats: Stats): void {
        void _stats;
    }

    // Falkenauer’s Grouping Fitness
    score(sol: Solution): number {
        let total = 0;
        let numEmptyBoxes = 0;
        for (const box of sol.idToBox.values()) {
            if (box.fillRatio === 0) {
                numEmptyBoxes++;
                continue;
            }
            total += box.fillRatio ** 2;
        }
        total /= sol.idToBox.size - numEmptyBoxes;
        return total;
    }
    // Goal: Maximize
    isBetterScore(a: number, b: number): boolean {
        return a > b;
    }
}

// Compute a dynamic packing penalty over all rectangle pairs with time-based weights
// Goal: Minimize
export class PackingPenaltyObjective implements ObjectiveFunction<Solution> {
    private curIter: number;
    private maxIter: number;

    constructor(curIter: number = 0, maxIter: number = 1) {
        this.curIter = Math.max(0, curIter);
        this.maxIter = Math.max(1, maxIter);
    }

    // Optional helper to update iteration externally
    update(stats: Stats) {
        this.curIter = stats.iteration;
        // if (maxIter !== undefined) this.maxIter = maxIter;
    }

    score(sol: Solution): number {
        const progress = this.curIter / this.maxIter; // run from 0 to 1

        let sumOverlap = 0;
        let maxOverlap = 0;
        let overlapCount = 0;
        const numBoxes = sol.idToBox.size;

        // check each box
        for (const box of [...sol.idToBox.values()]) {
            const rects = box.rectangles;

            for (let i = 0; i < rects.length; i++) {
                for (let j = i + 1; j < rects.length; j++) {
                    const overlap = calOverlapRate(rects[i], rects[j]);
                    if (overlap > 0) {
                        sumOverlap += overlap;
                        if (overlap > maxOverlap) maxOverlap = overlap;
                        overlapCount += 1;
                    }
                }
            }
        }

        // dynamic weights
        const alpha = 5;
        const beta = 50 * Math.pow(progress, 2);
        const gamma = 1 * progress;
        const delta = 10 * Math.pow(progress, 2);

        const penalty = alpha * sumOverlap + beta * maxOverlap + gamma * overlapCount + delta * numBoxes;
        return penalty;
    }

    // Goal: Minimize
    isBetterScore(a: number, b: number): boolean {
        return a < b;
    }
}

// function PackingPenalty(rectangles, t, T):
//     progress ← t / T

//     sumOverlap ← 0
//     maxOverlap ← 0
//     overlapCount ← 0

//     for each pair (i, j):
//         overlap ← OverlapArea(i, j)

//         if overlap > 0:
//             sumOverlap ← sumOverlap + overlap
//             maxOverlap ← max(maxOverlap, overlap)
//             overlapCount ← overlapCount + 1

//     // dynamic weights
//     α ← 1
//     β ← 10 * progress^2       // hard constraint ramps up
//     γ ← 0.1 * progress

//     penalty ← α * sumOverlap
//              + β * maxOverlap
//              + γ * overlapCount

//     return penalty

// Goal: Minimize
// export class TotalOverlap implements ObjectiveFunction<Solution> {
//     score(sol: Solution): number {
//         let totalOverlap = 0;
//         const rects = [...sol.idToBox.values()].flatMap(
//             (box) => box.rectangles,
//         );

//         for (let i = 0; i < rects.length; i++) {
//             for (let j = i + 1; j < rects.length; j++) {
//                 totalOverlap += calOverlapRate(rects[i], rects[j]);
//             }
//         }
//         return totalOverlap;
//     }
//     // Goal: Maximize
//     isBetterScore(a: number, b: number): boolean {
//         return a < b;
//     }
// }

// Goal: Minimize
// export class SmoothedOverlap implements ObjectiveFunction<Solution> {
//     score(sol: Solution): number {
//         let totalOverlap = 0;
//         const rects = [...sol.idToBox.values()].flatMap(
//             (box) => box.rectangles,
//         );

//         for (let i = 0; i < rects.length; i++) {
//             for (let j = i + 1; j < rects.length; j++) {
//                 totalOverlap += calOverlapRate(rects[i], rects[j]) ** 2;
//             }
//         }
//         return Math.sqrt(totalOverlap);
//     }
//     isBetterScore(a: number, b: number): boolean {
//         return a < b;
//     }
// }
