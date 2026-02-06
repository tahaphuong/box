import { useState, useContext } from "react";

import {
    Algo,
    SelectionOption,
    NeighborhoodOption,
    PlacementOption,
} from "@/models";

import { handleSolveBinPacking } from "@/handlers";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, ChevronsUpDown, Loader2 } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { PopOverOptions } from "@/components/ui/pop-over-options";
import { TableRectangles } from "@/components/ui/table-rectangles";

import { MainContext } from "@/context/MainContext";

export function CurrentInstance() {
    const [numNeighbors, setNumNeighbors] = useState<string>("10");
    const [maxIters, setMaxIters] = useState<string>("50");

    const [algo, setAlgo] = useState<string>(Algo.GREEDY);
    const [selection, setSelection] = useState<string>(SelectionOption.LONGEST);
    const [placement, setPlacement] = useState<string>(
        PlacementOption.SHELF_FIRST_FIT,
    );
    const [neighborhood, setNeighborhood] = useState<string>(
        NeighborhoodOption.GEOMETRY,
    );
    const [isLoadingSolve, setIsLoadingSolve] = useState<boolean>(false);

    const [openSelection, setOpenSelection] = useState<boolean>(false);
    const [openPlacement, setOpenPlacement] = useState<boolean>(false);
    const [openNeighborhood, setOpenNeighborhood] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const { instance, setSolution, setStats } = useContext(MainContext) ?? {
        instance: null,
        setSolution: null,
        setStats: null,
    };

    const isScrollable: boolean = !instance
        ? false
        : instance.rectangles.length > 3;

    const handleSolve = () => {
        if (!instance) {
            setError("Please generate an instance first");
            return;
        }
        instance.rectangles.forEach((rect) => rect.reset());
        if (setSolution) setSolution(null);

        const [solution, stats] = handleSolveBinPacking(
            instance,
            algo,
            selection,
            neighborhood,
            placement,
            Number(numNeighbors),
            Number(maxIters),
        );
        if (setSolution) {
            setSolution(solution);
        }
        if (setStats) setStats(stats);
    };

    const onClickSolve = (): void => {
        setError("");
        setIsLoadingSolve(true);
        setTimeout(() => {
            try {
                handleSolve();
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
                );
            } finally {
                setIsLoadingSolve(false);
            }
        }, 0);
    };

    return (
        <div className="grid w-full gap-2 text-left">
            <div className="text-xl font-bold text-gray-800">
                2. Current Instance
            </div>
            {!instance ? (
                <div>No instance currently (￣﹃￣)</div>
            ) : (
                <div className="w-full">
                    <div className="text-sm">
                        <div>Box length L = {instance.L}</div>
                        <div>
                            Number of rectangles N ={" "}
                            {instance.rectangles.length}
                        </div>
                    </div>
                    <TableRectangles
                        isScrollable={isScrollable}
                        instance={instance}
                    />
                    {/* Choose algorithm: greedy or local search */}
                    <RadioGroup
                        className="flex justify-items-start mt-2"
                        value={algo}
                        onValueChange={setAlgo}
                    >
                        <Label className="font-medium">Algorithm:</Label>
                        {Object.entries(Algo).map(([key, label]) => (
                            <div
                                key={key}
                                className="flex items-center space-x-2"
                            >
                                <RadioGroupItem value={label} id={key} />
                                <Label
                                    htmlFor={key}
                                    className="font-normal text-sm"
                                >
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
                        <Popover
                            open={openSelection}
                            onOpenChange={setOpenSelection}
                        >
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
                                onSelectOption={(val) => {
                                    setSelection(val);
                                    setOpenSelection(false);
                                }}
                            />
                        </Popover>
                    </div>

                    {/** Choose neighborhood */}
                    {algo === Algo.LOCAL && (
                        <div className="grid gap-2">
                            <div className="flex justify-start gap-2 align-middle">
                                <Label className="font-medium">
                                    Neighborhood:
                                </Label>
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
                                        onSelectOption={(val) => {
                                            setNeighborhood(val);
                                            setOpenNeighborhood(false);
                                        }}
                                    />
                                </Popover>
                            </div>
                        </div>
                    )}

                    {/** Choose placement routine */}
                    <div className="flex justify-start gap-2 align-middle">
                        <Label className="font-medium">Placement:</Label>
                        <Popover
                            open={openPlacement}
                            onOpenChange={setOpenPlacement}
                        >
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
                                onSelectOption={(val) => {
                                    setPlacement(val);
                                    setOpenPlacement(false);
                                }}
                            />
                        </Popover>
                    </div>

                    {/** Input num neighbors & max iterations */}
                    {algo === Algo.LOCAL && (
                        <div className="grid w-full gap-2 text-left mt-3 mb-3">
                            <InputField
                                typeInput="number"
                                value={numNeighbors}
                                setValueFunc={setNumNeighbors}
                                label="Number neighbors 👩"
                            />
                            <InputField
                                typeInput="number"
                                value={maxIters}
                                setValueFunc={setMaxIters}
                                label="Max iterations 🕓"
                            />
                            {neighborhood === NeighborhoodOption.GEOMETRY && (
                                <div className="text-xs text-gray-400">
                                    Local search with Geometry neighborhood will
                                    try to relocate rectangles from low util
                                    boxes from an initial{" "}
                                    <strong>Shelf First Fit</strong> solution
                                </div>
                            )}
                            {neighborhood ===
                                NeighborhoodOption.PERMUTATION && (
                                <div className="text-xs text-gray-400">
                                    Local search with Permutation neighborhood
                                    will try to change selection input order and
                                    repack from an initial solution. routine.
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="text-xs text-red-500 mt-2">{error}</div>
                    )}
                    <Button
                        className={`mt-2 ${isLoadingSolve ? "opacity-50" : "opacity-100"}`}
                        variant="default"
                        onClick={onClickSolve}
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
            )}
        </div>
    );
}

export default CurrentInstance;
