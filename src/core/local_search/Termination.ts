import type { Stats } from "./Stats";

export type Termination = (data: Stats) => boolean;

export const maxIterations =
    (limit: number): Termination =>
    (d) =>
        d.iteration >= limit;

// no better solution
export const isStagnated =
    (limit: number): Termination =>
    (stats) =>
        stats.stagnationCounter >= limit;
