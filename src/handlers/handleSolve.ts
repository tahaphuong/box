import { Instance, Solution } from "@/models/binpacking";
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
    maxIterations,
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
    maxIters: number
): Solution {
    const start = performance.now();
    const selection = createSelectionBinPack(
        selectionOpt as SelectionOptionType,
        instance.rectangles,
    );
    
    let solution = new Solution(instance.L);

    switch (algo) {
        case Algo.GREEDY: {
            const placement = createPlacementBinPack(
                placementOpt as PlacementOptionType,
            );
            const algo = new GreedyAlgo(solution, selection, placement);
            solution = algo.solve();
            break;
        }
        case Algo.LOCAL: {
            const initialPlacement = createPlacementBinPack(PlacementOption.SHELF_FIRST_FIT)
            const greedyAlgo = new GreedyAlgo(solution, selection, initialPlacement);
            const greedySolution = greedyAlgo.solve();

            const strategy = new HillClimbingStrategy<Solution>();
            const terminate = maxIterations(maxIters);
            const neighborhood = createNeighborhoodBinPack(
                neighborhoodOpt as NeighborhoodOptionType,
                numNeighbors,
            );
            const objective = new UltilizationBox();
            const betterPlacement = createPlacementBinPack(PlacementOption.SHELF_BEST_AREA_FIT);
            betterPlacement.cloneCurrentPlacementFrom(initialPlacement);

            const algo = new LocalSearchAlgo(
                greedySolution,
                betterPlacement,
                strategy,
                terminate,
                neighborhood,
                objective,
            );
            solution = algo.solve();
        }
    }

    const runtime = performance.now() - start;
    solution.setRunTime(runtime);

    return solution;
}
