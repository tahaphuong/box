import { useState, useContext } from "react";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { InputField } from "@/components/ui/input-field";

import type { Instance } from "@/models/binpacking";

import { parseInputToConfig } from "@/handlers";
import { generateInstance } from "@/handlers/generateInstance";

import { MainContext } from "@/context/MainContext";

export function ParamInput() {
    const [L, setL] = useState<string>("220");
    const [numRect, setNumRectangles] = useState<string>("1000");
    const [widthRange, setWidthRange] = useState<string>("5-200");
    const [heightRange, setHeightRange] = useState<string>("5-200");

    const [error, setError] = useState<string>("");

    const [isLoadingGen, setIsLoadingGen] = useState<boolean>(false);

    const { setInstance } = useContext(MainContext) ?? {
        instance: null,
        setInstance: null,
        setSolution: null,
    };

    const handleGenerate = () => {
        const config = parseInputToConfig(L, numRect, widthRange, heightRange);
        const newInstance: Instance = generateInstance(config);
        if (setInstance) setInstance(newInstance);
    };

    const onClickGenerate = (): void => {
        setError("");
        setIsLoadingGen(true);
        setTimeout(() => {
            try {
                handleGenerate();
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
                );
            } finally {
                setIsLoadingGen(false);
            }
        }, 0);
    };

    return (
        <div className="grid w-full gap-2 text-left">
            <div className="text-xl font-bold text-gray-800">1. Generation</div>

            <div className="text-xs text-gray-400">
                <div>
                    <div className="mb-1">
                        Box length and rectangles settings can be set
                        arbitrarily, but with the following thresholds:
                    </div>
                </div>
                <div>
                    <span className="font-semibold">Box length:</span> 1 ≤ L ≤
                    10000
                </div>
                <div>
                    <span className="font-semibold">Number of rectangles:</span>{" "}
                    1 ≤ N ≤ 1000
                </div>
                <div>
                    <span className="font-semibold">Width and Height:</span> 1 ≤
                    W, H ≤ L
                </div>
            </div>

            <div className="grid gap-2">
                <InputField
                    typeInput="number"
                    value={L}
                    setValueFunc={setL}
                    label="Box length"
                />
                <InputField
                    typeInput="number"
                    value={numRect}
                    setValueFunc={setNumRectangles}
                    label="Number of rectangles"
                />
                <InputField
                    typeInput="text"
                    value={widthRange}
                    setValueFunc={setWidthRange}
                    label="Width range 📐"
                />
                <InputField
                    typeInput="text"
                    value={heightRange}
                    setValueFunc={setHeightRange}
                    label="Height range📏"
                />
            </div>

            {error && <div className="text-xs text-red-500 mt-2">{error}</div>}

            {/* Generate instance */}
            <Button
                className={`mt-2 ${isLoadingGen ? "opacity-50" : "opacity-100"}`}
                variant="default"
                onClick={onClickGenerate}
                disabled={isLoadingGen}
            >
                {isLoadingGen ? (
                    <Loader2 className="mr-2 h-4 w-4" />
                ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                )}
                <span className="text-sm">
                    {isLoadingGen ? "Generating..." : "Generate instance"}
                </span>
            </Button>
        </div>
    );
}

export default ParamInput;
