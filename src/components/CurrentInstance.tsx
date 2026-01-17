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
import type { Rectangle } from "@/models"


const neighborhoods = [
  { value: "1", label: "Geometry-based" },
  { value: "2", label: "Rule-based" },
  { value: "3", label: "Overlap" },
]

const selections = [
  { value: "1", label: "Longest side" },
  { value: "2", label: "Largest area" },
]

const algos = [
  { value: "greedy", label: "Greedy", options: selections },
  { value: "local", label: "Local Search", options: neighborhoods }
]

export function CurrentInstance() {
  const [algo, setAlgo] = useState<string>("greedy")
  const [option, setOption] = useState<string>("1")
  const [openOption, setOpenOption] = useState<boolean>(false)
  const { instance } = useContext(MainContext) || {};

  const isScrollable = rows.length > 3


  const onChangeAlgo = (value: string): void => {
    setAlgo(value);
    setOption("1");
    setOpenOption(false);
  };

  const handleSolve = () => {
    console.log(instance)
  }

  return (
    <div className="grid w-full gap-2 text-left">
      <div className="text-xl font-bold text-gray-800">2. Current Instance</div>
      {!instance ? <div>No instance currently</div> :
        <div className="w-full">
          <div className="text-sm">
            <div>Box length L = {instance.L}</div>
            <div>Number of rectangles N = { instance.getCount() }</div>
          </div>
          <div className={`mt-2 relative w-70 rounded-md border ${isScrollable ? 'h-34 overflow-y-auto' : ''}`}>
            <Table>
              <TableHeader>
                <TableRow className="h-6 py-0">
                  <TableHead className="w-0.5">Nr.</TableHead>
                  <TableHead className="w-3">Width</TableHead>
                  <TableHead className="w-3">Height</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instance.rectangles.map((rect: Rectangle, index: number) => (
                  <TableRow key={index} className="h-8">
                    <TableCell className="font-medium w-0.5 py-1">{index+1}</TableCell>
                    <TableCell className="w-3 py-1">{rect.width}</TableCell>
                    <TableCell className="w-3 py-1">{rect.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Choose algorithm: greedy or local search */}
          <RadioGroup className="flex justify-items-start mt-2" value={algo} onValueChange={onChangeAlgo}>
            <Label className="font-medium">Algorithm:</Label>

            {algos.map((a) => (
              <div key={a.value} className="flex items-center space-x-2">
                <RadioGroupItem value={a.value} id={a.value} />
                <Label htmlFor={a.value} className="font-normal text-sm">{a.label}</Label>
              </div>
            ))}

            <div className="flex items-center space-x-2" style={{ display: 'none' }}>
            </div>
          </RadioGroup>

          {/* Algorithm options selector */}
          {algos.map((a) => (
            algo === a.value && (
              <div key={a.value} className="flex justify-between align-middle">
                <Label className="font-medium">
                  {a.value === "greedy" ? "Selection strategy:" : "Neighborhood:"}
                </Label>
                <Popover open={openOption} onOpenChange={setOpenOption}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      role="combobox"
                      aria-expanded={openOption}
                      className="w-40 justify-between mt-2"
                    >
                      {option
                        ? a.options.find((opt: any) => opt.value === option)?.label
                        : `Select ${a.value === "greedy" ? "strategy" : "neighborhood"}...`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-45 p-0">
                    <Command>
                      <CommandEmpty>No options found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {a.options.map((opt: any) => (
                            <CommandItem
                              key={opt.value}
                              value={opt.value}
                              onSelect={(currentValue) => {
                                setOption(currentValue)
                                setOpenOption(false)
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${option === opt.value ? "opacity-100" : "opacity-0"}`}
                              />
                              {opt.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )
          ))}


          <Button className="mt-2" variant='default' onClick={handleSolve}>
            <span className="text-sm">Solve</span> <ArrowRight />
          </Button>
        </div>}
    </div>
  )
}

export default CurrentInstance
