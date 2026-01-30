import { type GeneratorConfig, Instance, Solution } from "@/models/binpacking";
import type { PlacementOptionType, SelectionOptionType } from "@/models";
import { Algo } from "@/models";
import {
    GreedyAlgo,
    createGreedyPlacement,
    createGreedySelection,
} from "@/core/greedy";
import { generateInstance } from "./generateInstance";
/**
 * Use Algo here based on user input
 */

export function handleSolveBinPacking(
    config: GeneratorConfig,
    algo: string,
    option: string,
    placementOpt: string,
): { instance: Instance; solution: Solution } {
    const instance: Instance = generateInstance(config);

    const start = performance.now();
    const selection = createGreedySelection(
        option as SelectionOptionType,
        instance.rectangles,
    );
    const placement = createGreedyPlacement(
        placementOpt as PlacementOptionType,
    );
    const startSolution = new Solution(instance.L);
    const result = { instance: instance, solution: startSolution };

    switch (algo) {
        case Algo.GREEDY: {
            const algo = new GreedyAlgo(startSolution, selection, placement);
            result.solution = algo.solve();
            break;
        }
        case Algo.LOCAL: {
            // const greedyAlgo = new GreedyAlgo(
            //     startSolution,
            //     selection,
            //     placement,
            // );
            // const greedySolution = greedyAlgo.solve();

            // const algo = new LocalSearchAlgo(greedySolution, placement);
            // result.solution = algo.solve();
            break;
        }
    }

    const runtime = performance.now() - start;
    result.solution.setRunTime(runtime);
    console.log(result.solution);
    return result;
}
