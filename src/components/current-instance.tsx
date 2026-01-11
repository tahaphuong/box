import { useState } from "react"

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

const neighborhoods = [
  { value: "1", label: "Geometry-based" },
  { value: "2", label: "Rule-based" },
  { value: "3", label: "Overlap" },
]

const selections = [
  { value: "1", label: "Longest side" },
  { value: "2", label: "Largest area" },
]

export function CurrentInstance() {
  const [algo, setAlgo] = useState("greedy")
  const [neighborhood, setNeighborhood] = useState("1")
  const [selection, setSelection] = useState("1")
  const [openNeighborhood, setOpenNeighborhood] = useState(false)
  const [openSelection, setOpenSelection] = useState(false)

  const rows = [
    { nr: 1, width: 10, height: 20 },
    { nr: 2, width: 10, height: 20 },
    { nr: 3, width: 10, height: 20 },
    { nr: 4, width: 10, height: 20 },
    { nr: 5, width: 10, height: 20 },
    { nr: 6, width: 10, height: 20 },
  ]

  const isScrollable = rows.length > 3

  return (
    <div className="grid w-full gap-2 text-left">
      <div className="text-xl font-bold text-gray-800">2. Current Instance</div>
      <div className="text-sm">
        <div>Box length L = 70</div>
        <div>Number of rectangles N = 10</div>
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
            {rows.map((row) => (
              <TableRow key={row.nr} className="h-8">
                <TableCell className="font-medium w-0.5 py-1">{row.nr}</TableCell>
                <TableCell className="w-3 py-1">{row.width}</TableCell>
                <TableCell className="w-3 py-1">{row.height}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Choose algorithm: greedy or local search */}
      <RadioGroup className="flex justify-items-start mt-2" value={algo} onValueChange={setAlgo}>
        <Label className="font-medium">Algorithm:</Label>
        <div className="flex items-center space-x-2" >
          <RadioGroupItem value="greedy" id="greedy" />
          <Label htmlFor="greedy" className="font-normal text-sm">Greedy</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="local" id="local" />
          <Label htmlFor="local" className="font-normal text-sm">Local Search</Label>
        </div>
      </RadioGroup>

      {/* Greedy heuristic selector */}
      {algo === "greedy" && (
        <div className="flex gap-3">
          <Label className="font-medium">Selection criteria:</Label>
          <Popover open={openSelection} onOpenChange={setOpenSelection}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                role="combobox"
                aria-expanded={openSelection}
                className="w-40 justify-between mt-2"
              >
                {selection
                  ? selections.find((h) => h.value === selection)?.label
                  : "Selection strategy..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-45 p-0">
              <Command>
                <CommandEmpty>No selection found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {selections.map((h) => (
                      <CommandItem
                        className="CurrentInstance"
                        key={h.value}
                        value={h.value}
                        onSelect={(currentValue) => {
                          setSelection(currentValue)
                          setOpenSelection(false)
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${selection === h.value ? "opacity-100" : "opacity-0"}`}
                        />
                        {h.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Local search neighborhood selector */}
      {algo === "local" && (
        <div className="flex gap-3">
          <Label className="font-medium">Neighborhood:</Label>
          <Popover open={openNeighborhood} onOpenChange={setOpenNeighborhood}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                role="combobox"
                aria-expanded={openNeighborhood}
                className="w-45 justify-between mt-2 CurrentInstance"
              >
                {neighborhood
                  ? neighborhoods.find((n) => n.value === neighborhood)?.label
                  : "Select neighborhood..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-45 p-0">
              <Command>
                <CommandEmpty>No neighborhood found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {neighborhoods.map((n) => (
                      <CommandItem
                        className="CurrentInstance"
                        key={n.value}
                        value={n.value}
                        onSelect={(currentValue) => {
                          setNeighborhood(currentValue)
                          setOpenNeighborhood(false)
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${neighborhood === n.value ? "opacity-100" : "opacity-0"
                            }`}
                        />
                        {n.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <Button className="mt-2" variant='default'><span className="text-sm">Solve</span> <ArrowRight /> </Button>
    </div>
  )
}

export default CurrentInstance
