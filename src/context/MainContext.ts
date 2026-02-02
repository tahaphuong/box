import { createContext, type Dispatch, type SetStateAction } from "react";
import { Instance, Solution, type SolutionStats } from "@/models/binpacking";

export const MainContext = createContext<{
    instance: Instance | null;
    setInstance: Dispatch<SetStateAction<Instance | null>>;

    solution: Solution | null;
    setSolution: Dispatch<SetStateAction<Solution | null>>;

    stats: SolutionStats | null;
    setStats: Dispatch<SetStateAction<SolutionStats | null>>;
} | null>(null);
