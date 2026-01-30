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

export function ParamInput() {
    const [L, setL] = useState<string>("200");
    const [numRect, setNumRectangles] = useState<string>("1000");
    const [widthRange, setWidthRange] = useState<string>("20-200");
    const [heightRange, setHeightRange] = useState<string>("20-200");
    const [error, setError] = useState<string>("");
    const [algo, setAlgo] = useState<string>(Algo.GREEDY);
    const [option, setOption] = useState<string>(SelectionOption.LONGEST);
    const [placement, setPlacement] = useState<string>(
        PlacementOption.SHELF_FIRST_FIT,
    );

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [openOption, setOpenOption] = useState<boolean>(false);
    const [openPlacement, setOpenPlacement] = useState<boolean>(false);

    const { setInstance, setSolution } = useContext(MainContext) ?? {
        setSolution: null,
    };

    const handleGenerateSolve = () => {
        const config = parseInputToConfig(L, numRect, widthRange, heightRange);

        if (setInstance) setInstance(null);
        if (setSolution) setSolution(null);
        const { instance, solution } = handleSolveBinPacking(
            config,
            algo,
            option,
            placement,
        );
        if (setInstance) setInstance(instance);
        if (setSolution) setSolution(solution);
        setIsLoading(false);
    };

    const onSelectAlgo = (value: string): void => {
        const firstOption = (
            value === Algo.GREEDY
                ? Object.values(SelectionOption)
                : Object.values(NeighborhoodOption)
        )[0];

        setAlgo(value);
        setOption(firstOption);
        setOpenOption(false);
    };

    const onSelectOption = (value: string): void => {
        setOption(value);
        setOpenOption(false);
    };

    const onSelectPlacementOption = (value: string): void => {
        setPlacement(value);
        setOpenPlacement(false);
    };

    const onClickGenerateSolve = (): void => {
        setIsLoading(true);
        setError("");
        setTimeout(() => {
            try {
                handleGenerateSolve();
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
                );
                setIsLoading(false);
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
                onValueChange={onSelectAlgo}
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

            {/* Algorithm options selector */}
            {algo === Algo.GREEDY && (
                <div className="flex justify-start gap-2 align-middle">
                    <Label className="font-medium">Selection:</Label>
                    <Popover open={openOption} onOpenChange={setOpenOption}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                role="combobox"
                                aria-expanded={openOption}
                                className="w-35 justify-between mt-2"
                            >
                                {option}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopOverOptions
                            options={SelectionOption}
                            option={option}
                            onSelectOption={onSelectOption}
                        />
                    </Popover>
                </div>
            )}

            {algo === Algo.LOCAL && (
                <div className="flex justify-start gap-2 align-middle">
                    <Label className="font-medium">Neighborhood:</Label>
                    <Popover open={openOption} onOpenChange={setOpenOption}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                role="combobox"
                                aria-expanded={openOption}
                                className="w-35 justify-between mt-2"
                            >
                                {option}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopOverOptions
                            options={NeighborhoodOption}
                            option={option}
                            onSelectOption={onSelectOption}
                        />
                    </Popover>
                </div>
            )}

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
                        onSelectOption={onSelectPlacementOption}
                    />
                </Popover>
            </div>

            {error && <div className="text-xs text-red-500 mt-2">{error}</div>}

            <Button
                className={`mt-2 ${isLoading ? "opacity-50" : "opacity-100"}`}
                variant="default"
                onClick={onClickGenerateSolve}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4" />
                ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                )}
                <span className="text-sm">
                    {isLoading ? "Generate and solve..." : "Generate and solve"}
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
