import type { AlgoSolution } from "@/models";
import type { Stats, ObjectiveFunction } from ".";
import { shuffle } from "@/core/local_search/helpers";

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
    pickNext(
        neighbors: SOL[],
        stats: Stats,
        objective: ObjectiveFunction<SOL>,
    ): [SOL | null, number] {
        let bestNb: SOL | null = null;
        let bestNbScore = stats.currentScore;

        // pick best neighbor (including the current solution)
        for (const nb of neighbors) {
            const nbScore = objective.score(nb);
            if (
                nbScore != null &&
                objective.isBetterScore(nbScore, bestNbScore)
            ) {
                bestNb = nb;
                bestNbScore = nbScore;
            }
        }
        // If found no better neighbor, return bestMove = null
        return [bestNb, bestNbScore];
    }

    update(nb: SOL | null, nbScore: number, stats: Stats): void {
        if (nb) {
            stats.stagnationCounter = 0;
            stats.currentScore = nbScore;
        } else {
            stats.stagnationCounter++;
        }
        stats.iteration++;
    }
}
export class SimulatedAnnealingStrategy<
    SOL extends AlgoSolution,
> implements LocalSearchStrategy<SOL> {
    private temperature: number;
    private readonly TStart: number;
    private readonly maxIter: number;

    constructor(options?: {
        initialTemperature?: number;
        // finalTemperature?: number;
        maxIter?: number;
    }) {
        this.maxIter = Math.max(1, options?.maxIter ?? 1000);
        this.TStart = options?.initialTemperature ?? 50;
        this.temperature = this.TStart;
    }

    pickNext(
        neighbors: SOL[],
        stats: Stats,
        objective: ObjectiveFunction<SOL>,
    ): [SOL | null, number] {
        if (neighbors.length === 0) return [null, stats.bestScore];

        // linear cooling
        const t = Math.min(stats.iteration + 1, this.maxIter);
        this.temperature = this.TStart / Math.log(t);

        const currentScore = stats.bestScore;

        // shuffle to avoid bias
        neighbors = shuffle(neighbors);
        for (const nb of neighbors) {
            const nbScore = objective.score(nb);
            let delta = nbScore - currentScore;
            let prob = 0;

            if (objective.isBetterScore(nbScore, currentScore)) {
                prob = 1;
            } else {
                delta = delta / Math.max(Math.abs(currentScore), 1e-6); // scale
                prob = Math.exp(-delta / this.temperature);
            }

            // console.log("Delta:", delta, "T:", this.temperature, "Prob:", prob);

            if (Math.random() < prob) {
                return [nb, nbScore];
            }
        }

        return [null, currentScore];
    }

    update(nb: SOL | null, nbScore: number, stats: Stats): void {
        if (nb) {
            stats.stagnationCounter = 0;
            stats.bestScore = nbScore;
        } else {
            stats.stagnationCounter++;
        }
        stats.iteration++;
    }
}

// function SimulatedAnnealing(sol):
//     TStart = initialTemperature
//     TEnd = finalTemperature
//     best = sol

//     for t = 1..MaxIter:
//         temperature = TStart * (TEnd / TStart)^(t / MaxIter)

//         neighbor = randomPerturb(sol)

//         E1 = Energy(sol, t)
//         E2 = Energy(neighbor, t)

//         Δ = E2 - E1

//         if Δ < 0:
//             sol = neighbor
//         else if rand() < exp(-Δ / temperature):
//             sol = neighbor

//         if Energy(sol,t) < Energy(best,t):
//             best = sol

//     return best

// class TabuSearchStrategy<T> implements SearchStrategy<T> {
//   private tabuList: Set<string> = new Set();

//   update(current: T, next: T): void {
//     const moveKey = this.generateHash(current, next);
//     this.tabuList.add(moveKey);

//
//   }
// }
