import { type AlgoConfig, Instance, Solution } from "@/models";

export function handleSolve(config: AlgoConfig, instance: Instance): Solution {
  return new Solution(config, instance.L)
}
