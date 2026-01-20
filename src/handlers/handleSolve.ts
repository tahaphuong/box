import { Instance, Solution } from "@/models/binpacking";
import type { AlgoType, GreedyOptionType } from "@/models";
import { Algo, PlacementOption } from "@/models";
import { GreedyAlgo, createGreedyPlacement, createGreedySelection } from "@/core/greedy";
/**
 * Use Algo here based on user input
 */
export function handleSolveBinPacking(algo: AlgoType, option: string, instance: Instance): Solution {
  switch (algo) {
    case Algo.GREEDY:
      const selection = createGreedySelection(option as GreedyOptionType, instance.rectangles);
      const placement = createGreedyPlacement(PlacementOption.SHELF_FIRST_FIT);
      const solution = new Solution(instance.L);
      const algo = new GreedyAlgo(solution, selection, placement)
      return algo.solve();

    case Algo.LOCAL:
    default:
      return new Solution(instance.L);
  }

}
