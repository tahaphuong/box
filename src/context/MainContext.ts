import { createContext, type Dispatch, type SetStateAction } from "react";
import { Instance, Solution } from "@/models/binpacking";

export const MainContext = createContext<{
    instance: Instance | null;
    setInstance: Dispatch<SetStateAction<Instance | null>>;

    solution: Solution | null;
    setSolution: Dispatch<SetStateAction<Solution | null>>;
} | null>(null);
