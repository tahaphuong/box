import { Instance, Solution } from "@/models/binpacking";
import type {
    PlacementOptionType,
    SelectionOptionType,
    NeighborhoodOptionType,
} from "@/models";
import { Algo } from "@/models";
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
): Solution {
    const start = performance.now();
    const selection = createSelectionBinPack(
        selectionOpt as SelectionOptionType,
        instance.rectangles,
    );
    const placement = createPlacementBinPack(
        placementOpt as PlacementOptionType,
    );
    let solution = new Solution(instance.L);

    switch (algo) {
        case Algo.GREEDY: {
            const algo = new GreedyAlgo(solution, selection, placement);
            solution = algo.solve();
            break;
        }
        case Algo.LOCAL: {
            const greedyAlgo = new GreedyAlgo(solution, selection, placement);
            const greedySolution = greedyAlgo.solve();
            const strategy = new HillClimbingStrategy<Solution>();
            const terminate = maxIterations(20);
            const neighborhood = createNeighborhoodBinPack(
                neighborhoodOpt as NeighborhoodOptionType,
                10,
            );
            const objective = new UltilizationBox();
            // TODO: initiate new ShelfPlacement (SBFA) and copy from greedy to improve current shelf placement
            const algo = new LocalSearchAlgo(
                greedySolution,
                placement,
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

    console.log(solution); // Debug
    return solution;
}
