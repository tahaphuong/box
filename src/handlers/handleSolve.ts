import { Instance, Solution } from "@/models/binpacking";
import type { AlgoConfig } from "@/models";
import { createGreedySelection } from "@/models/AlgoConfig";
import { GreedyAlgo, ShelfFirstFit } from "@/core/greedy";

export function handleSolveBinPacking(config: AlgoConfig, instance: Instance): Solution {
  if (config.algo == "greedy") {
    const selection = createGreedySelection(config.option, instance.rectangles);
    const placement = new ShelfFirstFit();
    const solution = new Solution(config, instance.L);
    const algo = new GreedyAlgo(solution, selection, placement)
    return algo.solve();
  }

  return new Solution(config, instance.L);
}
