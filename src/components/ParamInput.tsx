import { useState, useContext } from "react";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, ChevronsUpDown, Loader2, Check } from "lucide-react";
import {
    Algo,
    SelectionOption,
    NeighborhoodOption,
    PlacementOption,
} from "@/models";
import { PopoverContent } from "@/components/ui/popover";

import { parseInputToConfig } from "@/handlers";
import { MainContext } from "@/context/MainContext";
import { handleSolveBinPacking } from "@/handlers";
import type { Instance } from "@/models/binpacking";
import { generateInstance } from "@/handlers/generateInstance";

export function ParamInput() {
    const [L, setL] = useState<string>("200");
    const [numRect, setNumRectangles] = useState<string>("1000");
    const [widthRange, setWidthRange] = useState<string>("20-200");
    const [heightRange, setHeightRange] = useState<string>("20-200");
    const [error, setError] = useState<string>("");

    const [algo, setAlgo] = useState<string>(Algo.GREEDY);
    const [selection, setSelection] = useState<string>(SelectionOption.LONGEST);
    const [placement, setPlacement] = useState<string>(
        PlacementOption.SHELF_FIRST_FIT,
    );
    const [neighborhood, setNeighborhood] = useState<string>(
        NeighborhoodOption.GEOMETRY,
    );

    const [isLoadingGen, setIsLoadingGen] = useState<boolean>(false);
    const [isLoadingSolve, setIsLoadingSolve] = useState<boolean>(false);

    const [openSelection, setOpenSelection] = useState<boolean>(false);
    const [openPlacement, setOpenPlacement] = useState<boolean>(false);
    const [openNeighborhood, setOpenNeighborhood] = useState<boolean>(false);

    const { instance, setInstance, setSolution } = useContext(MainContext) ?? {
        instance: null,
        setInstance: null,
        setSolution: null,
    };

    const handleGenerate = () => {
        const config = parseInputToConfig(L, numRect, widthRange, heightRange);
        const newInstance: Instance = generateInstance(config);
        if (setInstance) setInstance(newInstance);
    };

    const handleSolve = () => {
        if (!instance) {
            setError("Please generate an instance first");
            return;
        }
        instance.resetAllRectangles();
        if (setSolution) setSolution(null);
        const solution = handleSolveBinPacking(
            instance,
            algo,
            selection,
            neighborhood,
            placement,
        );
        if (setSolution) setSolution(solution);
    };

    const onClickGenerateSolve = (handleFunc: () => void): void => {
        setError("");

        if (handleFunc === handleGenerate) {
            setIsLoadingGen(true);
        } else if (handleFunc === handleSolve) {
            setIsLoadingSolve(true);
        }

        setTimeout(() => {
            try {
                handleFunc();
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
                );
            } finally {
                setIsLoadingGen(false);
                setIsLoadingSolve(false);
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
                <InputGroup>
                    <InputGroupInput
                        type="number"
                        placeholder="70"
                        value={L}
                        onChange={(e) => setL(e.target.value)}
                    />
                    <InputGroupAddon>
                        <Label className="text-gray-700">Box length:</Label>
                    </InputGroupAddon>
                </InputGroup>
                <InputGroup>
                    <InputGroupInput
                        type="number"
                        placeholder="10"
                        value={numRect}
                        onChange={(e) => setNumRectangles(e.target.value)}
                    />
                    <InputGroupAddon>
                        <Label className="text-gray-700">
                            Number of rectangles:
                        </Label>
                    </InputGroupAddon>
                </InputGroup>
                <InputGroup>
                    <InputGroupInput
                        type="text"
                        placeholder="E.g: 20-50"
                        value={widthRange}
                        onChange={(e) => setWidthRange(e.target.value)}
                    />
                    <InputGroupAddon>
                        <Label className="text-gray-700">Width range 📐</Label>
                    </InputGroupAddon>
                </InputGroup>
                <InputGroup>
                    <InputGroupInput
                        type="text"
                        placeholder="E.g: 30-70"
                        value={heightRange}
                        onChange={(e) => setHeightRange(e.target.value)}
                    />
                    <InputGroupAddon>
                        <Label className="text-gray-700">Height range📏</Label>
                    </InputGroupAddon>
                </InputGroup>
            </div>

            {/* Choose algorithm: greedy or local search */}
            <RadioGroup
                className="flex justify-items-start mt-2"
                value={algo}
                onValueChange={setAlgo}
            >
                <Label className="font-medium">Algorithm:</Label>
                {Object.entries(Algo).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                        <RadioGroupItem value={label} id={key} />
                        <Label htmlFor={key} className="font-normal text-sm">
                            {label}
                        </Label>
                    </div>
                ))}

                <div
                    className="flex items-center space-x-2"
                    style={{ display: "none" }}
                ></div>
            </RadioGroup>

            {/* Choose selection order */}
            <div className="flex justify-start gap-2 align-middle">
                <Label className="font-medium">Selection:</Label>
                <Popover open={openSelection} onOpenChange={setOpenSelection}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="secondary"
                            role="combobox"
                            aria-expanded={openSelection}
                            className="w-35 justify-between mt-2"
                        >
                            {selection}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopOverOptions
                        options={SelectionOption}
                        option={selection}
                        onSelectOption={setSelection}
                    />
                </Popover>
            </div>

            {/** Choose placement routine */}
            <div className="flex justify-start gap-2 align-middle">
                <Label className="font-medium">Placement:</Label>
                <Popover open={openPlacement} onOpenChange={setOpenPlacement}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="secondary"
                            role="combobox"
                            aria-expanded={openPlacement}
                            className="w-20 justify-between mt-2"
                        >
                            {placement}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopOverOptions
                        options={PlacementOption}
                        option={placement}
                        onSelectOption={setPlacement}
                    />
                </Popover>
            </div>

            {/** Choose neighborhood */}
            {algo === Algo.LOCAL && (
                <div className="flex justify-start gap-2 align-middle">
                    <Label className="font-medium">Neighborhood:</Label>
                    <Popover
                        open={openNeighborhood}
                        onOpenChange={setOpenNeighborhood}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                role="combobox"
                                aria-expanded={openNeighborhood}
                                className="w-35 justify-between mt-2"
                            >
                                {neighborhood}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopOverOptions
                            options={NeighborhoodOption}
                            option={neighborhood}
                            onSelectOption={setNeighborhood}
                        />
                    </Popover>
                </div>
            )}

            {/* TODO: Input number neighbors & number iterations */}

            {error && <div className="text-xs text-red-500 mt-2">{error}</div>}

            <Button
                className={`mt-2 ${isLoadingGen ? "opacity-50" : "opacity-100"}`}
                variant="default"
                onClick={() => onClickGenerateSolve(handleGenerate)}
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

            <Button
                className={`mt-2 ${isLoadingSolve ? "opacity-50" : "opacity-100"}`}
                variant="default"
                onClick={() => onClickGenerateSolve(handleSolve)}
                disabled={isLoadingSolve}
            >
                {isLoadingSolve ? (
                    <Loader2 className="mr-2 h-4 w-4" />
                ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                )}
                <span className="text-sm">
                    {isLoadingSolve ? "Solving..." : "Solve"}
                </span>
            </Button>
        </div>
    );
}

const PopOverOptions = ({
    options,
    option,
    onSelectOption,
}: {
    options: Record<string, string>;
    option: string | null;
    onSelectOption: (value: string) => void;
}) => {
    return (
        <PopoverContent className="w-45 p-0">
            <Command>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandList>
                    <CommandGroup>
                        {Object.entries(options).map(([key, label]) => (
                            <CommandItem
                                key={key}
                                value={label}
                                onSelect={onSelectOption}
                            >
                                <Check
                                    className={`mr-2 h-4 w-4 ${option === key ? "opacity-100" : "opacity-0"}`}
                                />
                                {label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    );
};

export default ParamInput;
