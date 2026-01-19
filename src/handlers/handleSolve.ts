import { Instance, Solution } from "@/models/binpacking";
import type { AlgoConfig } from "@/models";
import { Algo } from "@/models";
import { GreedyAlgo, ShelfFirstFit, createGreedySelection } from "@/core/greedy";
/**
 * Use Algo here based on user input
 */
export function handleSolveBinPacking(config: AlgoConfig, instance: Instance): Solution {
  switch (config.algo) {
    case Algo.GREEDY:
      const selection = createGreedySelection(config.option, instance.rectangles);
      const placement = new ShelfFirstFit();
      const solution = new Solution(config, instance.L);
      const algo = new GreedyAlgo(solution, selection, placement)
      return algo.solve();

    case Algo.LOCAL:
    default:
      return new Solution(config, instance.L);
  }

}
