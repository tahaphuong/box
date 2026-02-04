import type { ObjectiveFunction } from "./Objective";

export abstract class Move<SOL> {
    abstract apply(solution: SOL, isPermanent: boolean): void;

    abstract undo(solution: SOL): void;

    // Evaluate the score of the move: apply then undo
    getScore(objective: ObjectiveFunction<SOL>, solution: SOL): number | null {
        this.apply(solution, false);
        const score = objective.score(solution);
        this.undo(solution);
        return score;
    }
}
