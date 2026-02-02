import type { AlgoInterface, AlgoSolution } from "@/models";
import type {
    Neighborhood,
    ObjectiveFunction,
    Termination,
    Stats,
    LocalSearchStrategy,
} from ".";
import type { GreedyPlacement } from "@/core/greedy";

export class LocalSearchAlgo<
    Item,
    SOL extends AlgoSolution,
> implements AlgoInterface<SOL> {
    placement: GreedyPlacement<Item, SOL>;

    private strategy: LocalSearchStrategy<SOL>; // how to pick best moves
    private terminate: Termination; // termination criteria based on stats
    private neighborhood: Neighborhood<Item, SOL>; // geometry, permutation or overlap
    private objective: ObjectiveFunction<SOL>; // how to evaluate the solution
    constructor(
        currentPlacement: GreedyPlacement<Item, SOL>,

        strategy: LocalSearchStrategy<SOL>,
        terminate: Termination,
        neighborhood: Neighborhood<Item, SOL>,
        objective: ObjectiveFunction<SOL>,
    ) {
        this.placement = currentPlacement;

        this.strategy = strategy;
        this.terminate = terminate;
        this.neighborhood = neighborhood;
        this.objective = objective;
    }

    solve(solution: SOL): SOL {
        const stats: Stats = {
            iteration: 0,
            bestScore: this.objective.score(solution),
            stagnationCounter: 0,
        };

        while (!this.terminate(stats)) {
            const moves = this.neighborhood.getAvailableMoves(
                solution,
                this.placement,
            );
            const [nextMove, nextMoveScore] = this.strategy.pickNext(
                solution,
                moves,
                stats,
                this.objective,
            );

            // If found "suitable" move -> apply (new neighbor)
            if (nextMove) {
                nextMove.apply(solution, true);
            }
            this.strategy.update(nextMove, nextMoveScore, stats);
        }
        return solution;
    }
}
