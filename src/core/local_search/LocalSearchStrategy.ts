import type { AlgoSolution } from "@/models";
import type { Stats, ObjectiveFunction } from ".";

export interface LocalSearchStrategy<SOL extends AlgoSolution> {
    // Pick the next neighbor (e.g., Tabu checks or SA probability)
    pickNext(
        neighbors: SOL[],
        stats: Stats,
        objective: ObjectiveFunction<SOL>,
    ): [SOL | null, number];

    // Update internal state (e.g., cooling temperature or updating Tabu list)
    update(nb: SOL | null, moveScore: number, stats: Stats): void;
}

export class HillClimbingStrategy<
    SOL extends AlgoSolution,
> implements LocalSearchStrategy<SOL> {
    // always find neighbor with best score
    pickNext(
        neighbors: SOL[],
        stats: Stats,
        objective: ObjectiveFunction<SOL>,
    ): [SOL | null, number] {
        let bestNb: SOL | null = null;
        let bestMoveScore = stats.bestScore;

        for (const nb of neighbors) {
            const mScore = objective.score(nb);
            if (
                mScore != null &&
                objective.isBetterScore(mScore, bestMoveScore)
            ) {
                bestNb = nb;
                bestMoveScore = mScore;
            }
        }
        // If found no better neighbor, return bestMove = null
        return [bestNb, bestMoveScore];
    }

    update(nb: SOL | null, moveScore: number, stats: Stats): void {
        if (nb) {
            stats.stagnationCounter = 0;
            stats.bestScore = moveScore;
        } else {
            stats.stagnationCounter++;
        }
        stats.iteration++;
    }
}

// BACKLOG: to escape local optimum
// class TabuSearchStrategy<T> implements SearchStrategy<T> {
//   private tabuList: Set<string> = new Set();

//   update(current: T, next: T): void {
//     const moveKey = this.generateHash(current, next);
//     this.tabuList.add(moveKey); // "Remember" this move to avoid cycles

//     // Logic to prune old tabu entries would go here
//   }
// }
