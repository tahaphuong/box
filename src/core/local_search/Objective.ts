import type { AlgoSolution } from "@/models";
import type { Solution } from "@/models/binpacking";

export interface ObjectiveFunction<SOL extends AlgoSolution> {
    score(sol: SOL): number;
    isBetterScore(a: number, b: number): boolean; // better score can be larger/smaller
}

// Goal: Maximize
export class UltilizationBox implements ObjectiveFunction<Solution> {
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
