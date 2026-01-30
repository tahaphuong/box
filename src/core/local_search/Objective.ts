import type { Solution } from "@/models/binpacking";

export interface ObjectiveFunction<SOL> {
    score(sol: SOL): number;
}

// Goal: Maximize
export class UltilBoxes implements ObjectiveFunction<Solution> {
    // Falkenauer’s Grouping Fitness
    score(sol: Solution): number {
        let total = 0;
        for (const box of sol.idToBox.values()) {
            total += box.fillRatio ** 2;
        }
        total /= sol.idToBox.size;
        return total;
    }
    isBetterScore(a: number, b: number): boolean {
        return a > b;
    }
}
