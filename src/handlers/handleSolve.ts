import { Instance, Solution, type SolutionStats } from "@/models/binpacking";
import type {
    PlacementOptionType,
    SelectionOptionType,
    NeighborhoodOptionType,
} from "@/models";
import { Algo, NeighborhoodOption, PlacementOption } from "@/models";
import {
    GreedyAlgo,
    OriginalSelection,
    createPlacementBinPack,
    createSelectionBinPack,
} from "@/core/greedy";
import {
    LocalSearchAlgo,
    createNeighborhoodBinPack,
    UltilizationBox,
    PackingPenaltyObjective,
    iterAndStagnated,
    maxIterations,
    HillClimbingStrategy,
} from "@/core/local_search";
import { RandomOverlapPlacement } from "@/core/greedy/placement/RandomOverlapPlacement";
// import { SimulatedAnnealingStrategy } from "@/core/local_search/LocalSearchStrategy";

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
    randomRate: number,
): [Solution, SolutionStats] {
    const start = performance.now();
    const stats: SolutionStats = {
        runtime: null,
        numBox: null,
        score: null,

        numBoxImproved: null,
        scoreImproved: null,
    };
    const selection = createSelectionBinPack(
        selectionOpt as SelectionOptionType,
        [...instance.rectangles],
    );
    const placement = createPlacementBinPack(
        placementOpt as PlacementOptionType,
    );
    let solution = new Solution(instance.L);

    switch (algo) {
        case Algo.GREEDY: {
            // If GREEDY -> solve
            const algo = new GreedyAlgo(selection, placement);
            solution = algo.solve(solution);
            stats.numBox = solution.idToBox.size;
            break;
        }
        case Algo.LOCAL: {
            let objective = new UltilizationBox();
            let terminate = iterAndStagnated(maxIters, 10); // max iter, stagnation threshold (early stop)
            const strategy = new HillClimbingStrategy<Solution>();

            switch (neighborhoodOpt) {
                case NeighborhoodOption.GEOMETRY: {
                    const initialPlacement = createPlacementBinPack(
                        PlacementOption.SHELF_FIRST_FIT,
                    );
                    const greedyAlgo = new GreedyAlgo(
                        selection,
                        initialPlacement,
                    );
                    solution = greedyAlgo.solve(solution);
                    placement.copyPlacementState(initialPlacement);
                    break;
                }

                case NeighborhoodOption.PERMUTATION: {
                    const greedyAlgo = new GreedyAlgo(selection, placement);
                    solution = greedyAlgo.solve(solution);
                    break;
                }

                case NeighborhoodOption.OVERLAP: {
                    // generate best feasible number of boxes and pack rectangles in random positions
                    const allRectsArea = instance.rectangles.reduce(
                        (acc, rect) => acc + rect.area,
                        0,
                    );
                    const minNumBoxes = Math.ceil(
                        allRectsArea / solution.L ** 2,
                    );
                    for (let i = 0; i < minNumBoxes; i++) {
                        solution.addNewBox();
                    }
                    terminate = maxIterations(maxIters);
                    objective = new PackingPenaltyObjective(0, maxIters);
                    // strategy = new SimulatedAnnealingStrategy<Solution>({
                    //     maxIter: maxIters,
                    // });
                    const originalSelection = new OriginalSelection([
                        ...instance.rectangles,
                    ]);
                    const randomPlacement = new RandomOverlapPlacement();
                    const greedyAlgo = new GreedyAlgo(
                        originalSelection,
                        randomPlacement,
                    );
                    solution = greedyAlgo.solve(solution); // gen random solution
                    break;
                }
            }

            // print score before local search
            stats.numBox = solution.idToBox.size;
            stats.score = objective.score(solution);

            // Init local search
            const neighborhood = createNeighborhoodBinPack(
                neighborhoodOpt as NeighborhoodOptionType,
                numNeighbors,
                placement,
                selection,
                randomRate,
                maxIters,
            );
            const algo = new LocalSearchAlgo(
                strategy,
                terminate,
                neighborhood,
                objective,
            );
            solution = algo.solve(solution);

            // print score after local search
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
