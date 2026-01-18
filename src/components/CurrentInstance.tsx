import { useContext, useState } from "react"

import { Table, TableHeader, TableRow, TableBody, TableHead, TableCell } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react"
import { MainContext } from "@/App"
import { ALGOS, type Algo, type AlgoOption, type AlgoConfig } from "@/models"
import { type Rectangle, Instance } from "@/models/binpacking"
import { handleSolveBinPacking } from "@/handlers"

// Define the default Algo and AlgoOption as the first values in list
const DEFAULT_ALGO: Algo = Object.keys(ALGOS)[0] as Algo;
const DEFAULT_ALGO_OPTION: AlgoOption<Algo> = Object.keys(ALGOS[DEFAULT_ALGO].options)[0] as AlgoOption<Algo>;

const TableRectangles = ({ isScrollable, instance }: { isScrollable: boolean; instance: Instance }) => {
  return (
    <div className={`mt-2 relative w-70 rounded-md border ${isScrollable ? 'h-34 overflow-y-auto' : ''}`}>
      <Table>
        <TableHeader>
          <TableRow className="h-6 py-0">
            <TableHead className="w-0.5">Id</TableHead>
            <TableHead className="w-2.5">Width</TableHead>
            <TableHead className="w-2.5">Height</TableHead>
            <TableHead className="w-0.5">Rotated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instance.rectangles.map((rect: Rectangle) => (
            <TableRow key={rect.id} className="h-8">
              <TableCell className="font-medium w-0.5 py-1">{rect.id}</TableCell>
              <TableCell className="w-2.5 py-1">{rect.getWidth}</TableCell>
              <TableCell className="w-2.5 py-1">{rect.getHeight}</TableCell>
              <TableCell className="w-0.5 py-1">{rect.rotated ? "yes" : "no"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>);
};

const PopOverOptions = ({algoData, option, onSelectOption}: {
  algoData: typeof ALGOS[Algo]; option: AlgoOption<Algo> | null; onSelectOption: (value: string) => void;}) => {
  return (
    <PopoverContent className="w-45 p-0">
      <Command>
        <CommandEmpty>No options found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            {Object.entries(algoData.options).map(([key, label]) => (
              <CommandItem
                key={key}
                value={key}
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

export function CurrentInstance() {
  const [algo, setAlgo] = useState<Algo>(DEFAULT_ALGO)
  const [option, setOption] = useState<AlgoOption<Algo>>(DEFAULT_ALGO_OPTION)
  const [openOption, setOpenOption] = useState<boolean>(false)
  const { instance, setSolution } = useContext(MainContext) ?? { instance: null };

  const isScrollable: boolean = !instance ? false : instance.rectangles.length > 3

  const onSelectAlgo = (value: string): void => {
    const algoKey = value as Algo;
    const firstOption = Object.keys(ALGOS[algoKey].options)[0] as AlgoOption<Algo>;
    setAlgo(algoKey);
    setOption(firstOption);
    setOpenOption(false);
  };

  const onSelectOption = (value: string): void => {
    setOption(value as AlgoOption<Algo>)
    setOpenOption(false)
  };

  const onClickSolve = (): void => {
    const config: AlgoConfig = { algo, option };
    if (instance && setSolution) {
      const sol = handleSolveBinPacking(config, instance);
      console.log(sol);
      setSolution(sol);

    }
  }

  return (
    <div className="grid w-full gap-2 text-left">
      <div className="text-xl font-bold text-gray-800">2. Current Instance</div>
      {!instance ? <div>No instance currently (￣﹃￣)</div> :
        <div className="w-full">
          <div className="text-sm">
            <div>Box length L = {instance.L}</div>
            <div>Number of rectangles N = {instance.rectangles.length}</div>
          </div>

          <TableRectangles isScrollable={isScrollable} instance={instance} />

          {/* Choose algorithm: greedy or local search */}
          <RadioGroup className="flex justify-items-start mt-2" value={algo} onValueChange={onSelectAlgo}>
            <Label className="font-medium">Algorithm:</Label>
            {(Object.entries(ALGOS)as Array<[Algo, typeof ALGOS[Algo]]>).map(([key, val]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key} className="font-normal text-sm">{val.label}</Label>
              </div>
            ))}

            <div className="flex items-center space-x-2" style={{ display: 'none' }}>
            </div>
          </RadioGroup>

          {/* Algorithm options selector */}
          {(Object.entries(ALGOS) as Array<[Algo, typeof ALGOS[Algo]]>).map(([key, val]) => (
            algo === key && (
              <div key={key} className="flex justify-between align-middle">
                <Label className="font-medium">
                  {val.optionLabel + ":"}
                </Label>
                <Popover open={openOption} onOpenChange={setOpenOption}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      role="combobox"
                      aria-expanded={openOption}
                      className="w-40 justify-between mt-2"
                    >
                      {val.options[option]}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopOverOptions algoData={val} option={option} onSelectOption={onSelectOption}
                  />
                </Popover>
              </div>
            )
          ))}


          <Button className="mt-2" variant='default' onClick={onClickSolve}>
            <span className="text-sm">Solve</span> <ArrowRight />
          </Button>
        </div>}
    </div>
  )
}

export default CurrentInstance
