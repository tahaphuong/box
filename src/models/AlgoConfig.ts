import { LargestAreaFirst, LongestSideFirst } from "@/core/greedy";
import type { GreedySelection } from "@/core/greedy";
import type { Rectangle } from "@/models/binpacking";

export const ALGOS = {
  greedy: {
    label: "Greedy",
    optionLabel: "Selection strategy",
    options: {
      longest: "Longest side",
      largest: "Largest area",
    },
  },
  local: {
    label: "Local Search",
    optionLabel: "Neighborhood",
    options: {
      geometry: "Geometry-based",
      rule: "Rule-based",
      overlap: "Overlap",
    },
  },
} as const;

export type Algo = keyof typeof ALGOS;

export type AlgoOption<A extends Algo> =
  keyof typeof ALGOS[A]["options"];

export type AlgoConfig<A extends Algo = Algo> = {
  algo: A;
  option: AlgoOption<A>;
};

export function createGreedySelection(
  option: AlgoOption<"greedy">,
  items: Rectangle[]
): GreedySelection<Rectangle> {
  switch (option) {
    case "longest":
      return new LongestSideFirst(items);
    case "largest":
      return new LargestAreaFirst(items);
    default: {
      const _exhaustive: never = option;
      throw new Error(`Unknown greedy option: ${_exhaustive}`);
    }
  }
}

export function createLocalSearchNeighborhood(
  option: AlgoOption<"local">,
) {
  switch (option) {
    case "geometry":
    case "rule":
    case "overlap":
    default:
  }
}
