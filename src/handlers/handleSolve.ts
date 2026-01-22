import { Instance, Solution } from "@/models/binpacking";
import type { PlacementOptionType, SelectionOptionType } from "@/models";
import { Algo } from "@/models";
import { GreedyAlgo, createGreedyPlacement, createGreedySelection } from "@/core/greedy";
/**
 * Use Algo here based on user input
 */
export function handleSolveBinPacking(algo: string, option: string, instance: Instance, placementOpt: string): Solution {
  switch (algo) {
    case Algo.GREEDY:
      const selection = createGreedySelection(option as SelectionOptionType, instance.rectangles);
      const placement = createGreedyPlacement(placementOpt as PlacementOptionType);
      const solution = new Solution(instance.L);
      const algo = new GreedyAlgo(solution, selection, placement)
      return algo.solve();

    case Algo.LOCAL:
    default:
      return new Solution(instance.L);
  }

}
