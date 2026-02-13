import type { AlgoInterface, AlgoSolution } from "@/models";
import type { Neighborhood, ObjectiveFunction, Termination, Stats, LocalSearchStrategy } from ".";
export class LocalSearchAlgo<SOL extends AlgoSolution> implements AlgoInterface<SOL> {
    private strategy: LocalSearchStrategy<SOL>; // how to pick best move
    private terminate: Termination; // termination criteria based on stats
    private neighborhood: Neighborhood<SOL>; // geometry, permutation or overlap
    private objective: ObjectiveFunction<SOL>; // how to evaluate the solution
    constructor(
        strategy: LocalSearchStrategy<SOL>,
        terminate: Termination,
        neighborhood: Neighborhood<SOL>,
        objective: ObjectiveFunction<SOL>,
    ) {
        this.strategy = strategy;
        this.terminate = terminate;
        this.neighborhood = neighborhood;
        this.objective = objective;
    }

    solve(solution: SOL): SOL {
        const stats: Stats = {
            iteration: 0,
            bestScore: this.objective.score(solution),
            currentScore: 0,
            stagnationCounter: 0,
        };

        let currentSolution = solution;

        while (!this.terminate(stats)) {
            this.objective.update(stats);
            stats.currentScore = this.objective.score(currentSolution);
            const neighbors = this.neighborhood.getNeighbors(currentSolution, stats);
            const [nextNb, nextNbScore] = this.strategy.pickNext(neighbors, stats, this.objective);

            // If found "suitable" move -> apply (new neighbor)
            if (nextNb) {
                currentSolution = nextNb;
            }
            this.strategy.update(nextNb, nextNbScore, stats);
            if (this.objective.isBetterScore(nextNbScore, stats.bestScore)) {
                stats.bestScore = nextNbScore;
            }
        }
        return currentSolution;
    }
}
