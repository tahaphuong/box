import type { AlgoSolution } from "./AlgoSolution";

export interface AlgoInterface<SOL extends AlgoSolution> {
  solve(solution: SOL): SOL
}
