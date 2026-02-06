import { Instance, Solution, type SolutionStats } from "@/models/binpacking";
import type {
    PlacementOptionType,
    SelectionOptionType,
    NeighborhoodOptionType,
} from "@/models";
import { Algo, NeighborhoodOption, PlacementOption } from "@/models";
import {
    GreedyAlgo,
    createPlacementBinPack,
    createSelectionBinPack,
} from "@/core/greedy";
import {
    LocalSearchAlgo,
    createNeighborhoodBinPack,
    UltilizationBox,
    iterAndStagnated,
    HillClimbingStrategy,
} from "@/core/local_search";
/**
 * Use Algo here based on user input
 */

export function handleSolveBinPacking(
    instance: Instance,
    algo: string,
    selectionOpt: string,
    neighborhoodOpt: string,
    placementOpt: string,

    numNeighbors: number,
    maxIters: number,
): [Solution, SolutionStats] {
    const start = performance.now();
    const selection = createSelectionBinPack(
        selectionOpt as SelectionOptionType,
        [...instance.rectangles],
    );
    const placement = createPlacementBinPack(
        placementOpt as PlacementOptionType,
    );

    let solution = new Solution(instance.L);
    const stats: SolutionStats = {
        runtime: null,
        numBox: null,
        score: null,

        numBoxImproved: null,
        scoreImproved: null,
    };

    switch (algo) {
        case Algo.GREEDY: {
            const algo = new GreedyAlgo(selection, placement);
            solution = algo.solve(solution);

            stats.numBox = solution.idToBox.size;
            break;
        }
        case Algo.LOCAL: {
            // init solution with SFF. Improve with either SBAF or BL (or SFF it self)
            // Note: If init with BL -> can only improve with BL or stateless placements

            if (neighborhoodOpt == NeighborhoodOption.GEOMETRY) {
                const initialPlacement = createPlacementBinPack(
                    PlacementOption.SHELF_FIRST_FIT,
                );
                const greedyAlgo = new GreedyAlgo(selection, initialPlacement);
                solution = greedyAlgo.solve(solution);
                placement.copyPlacementState(initialPlacement);
            } else if (neighborhoodOpt == NeighborhoodOption.PERMUTATION) {
                const greedyAlgo = new GreedyAlgo(selection, placement);
                solution = greedyAlgo.solve(solution);
            }

            // then improve
            const strategy = new HillClimbingStrategy<Solution>();
            const terminate = iterAndStagnated(maxIters, 10, 0.95); // max iter, stagnation threshold, stagnation ratio
            const objective = new UltilizationBox();

            // (shallow) copy initial placement state (SFF)
            const neighborhood = createNeighborhoodBinPack(
                neighborhoodOpt as NeighborhoodOptionType,
                numNeighbors,
                placement,
                selection,
                0.2, // random rate of selecting neighbors
            );

            // print score
            stats.numBox = solution.idToBox.size;
            stats.score = objective.score(solution);

            const algo = new LocalSearchAlgo(
                strategy,
                terminate,
                neighborhood,
                objective,
            );
            solution = algo.solve(solution);

            // print score
            const finalScore = objective.score(solution);
            stats.numBoxImproved = stats.numBox - solution.idToBox.size;
            stats.scoreImproved = Math.abs(stats.score - finalScore);

            stats.numBox = solution.idToBox.size;
            stats.score = finalScore;

            break;
        }
    }

    const runtime = performance.now() - start;
    stats.runtime = runtime;

    return [solution, stats];
}
