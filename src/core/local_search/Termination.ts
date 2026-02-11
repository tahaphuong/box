import type { Stats } from "./Stats";

export type Termination = (data: Stats) => boolean;

export const maxIterations =
    (limit: number): Termination =>
    (d) =>
        d.iteration >= limit;

export const iterAndStagnated =
    (limitIter: number, limitStagnation: number): Termination =>
    (d) =>
        d.iteration >= limitIter || d.stagnationCounter >= limitStagnation;
