import { Instance, Solution, type SolutionStats } from "@/models/binpacking";
import type {
    PlacementOptionType,
    SelectionOptionType,
    NeighborhoodOptionType,
} from "@/models";
import { Algo, PlacementOption } from "@/models";
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
        instance.rectangles,
    );

    let solution = new Solution(instance.L);
    const stats: SolutionStats = {
        runtime: null,
        numBox: null,
        score: null,

        numBoxImproved: null,
        scoreImproved: null,
    };
    const placement = createPlacementBinPack(
        placementOpt as PlacementOptionType,
    );

    switch (algo) {
        case Algo.GREEDY: {
            const placement = createPlacementBinPack(
                placementOpt as PlacementOptionType,
            );
            const algo = new GreedyAlgo(selection, placement);
            solution = algo.solve(solution);

            stats.numBox = solution.idToBox.size;
            break;
        }
        case Algo.LOCAL: {
            // init solution
            const initialPlacement = createPlacementBinPack(
                PlacementOption.SHELF_FIRST_FIT,
            );
            const greedyAlgo = new GreedyAlgo(selection, initialPlacement);
            const greedySolution = greedyAlgo.solve(solution);

            // then improve
            const strategy = new HillClimbingStrategy<Solution>();
            const terminate = iterAndStagnated(maxIters, 10, 0.95); // max iter, stagnation threshold, stagnation ratio
            const objective = new UltilizationBox();

            const neighborhood = createNeighborhoodBinPack(
                neighborhoodOpt as NeighborhoodOptionType,
                numNeighbors,
                instance,
                placement,
                0.2, // random rate of selecting neighbors
            );

            // print score
            stats.numBox = greedySolution.idToBox.size;
            stats.score = objective.score(greedySolution);

            const algo = new LocalSearchAlgo(
                strategy,
                terminate,
                neighborhood,
                objective,
            );
            solution = algo.solve(greedySolution);

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
