import type { Move, Stats, ObjectiveFunction } from ".";

export interface LocalSearchStrategy<SOL> {
    // Pick the next neighbor (e.g., Tabu checks or SA probability)
    pickNext(
        currentSolution: SOL,
        moves: Move<SOL>[],
        stats: Stats,
        objective: ObjectiveFunction<SOL>,
    ): [Move<SOL> | null, number];

    // Update internal state (e.g., cooling temperature or updating Tabu list)
    update(move: Move<SOL> | null, moveScore: number, stats: Stats): void;
}

export class HillClimbingStrategy<SOL> implements LocalSearchStrategy<SOL> {
    // always find neighbor with best score
    pickNext(
        current: SOL,
        moves: Move<SOL>[],
        _: Stats,
        objective: ObjectiveFunction<SOL>,
    ): [Move<SOL> | null, number] {
        let bestMove: Move<SOL> | null = null;
        let bestMoveScore = Number.NEGATIVE_INFINITY;

        for (const m of moves) {
            const mScore = m.getScore(objective, current);
            if (mScore != null && mScore > bestMoveScore) {
                bestMove = m;
                bestMoveScore = mScore;
            }
        }
        // If found no better neighbor, return bestMove = null
        return [bestMove, bestMoveScore];
    }

    update(move: Move<SOL> | null, moveScore: number, stats: Stats): void {
        if (move) {
            stats.stagnationCounter = 0;
            stats.bestScore = moveScore;
        } else {
            stats.stagnationCounter++;
        }
        stats.iteration++;
    }
}

// TODO: to escape local optimum
// class TabuSearchStrategy<T> implements SearchStrategy<T> {
//   private tabuList: Set<string> = new Set();

//   update(current: T, next: T): void {
//     const moveKey = this.generateHash(current, next);
//     this.tabuList.add(moveKey); // "Remember" this move to avoid cycles

//     // Logic to prune old tabu entries would go here
//   }
// }
