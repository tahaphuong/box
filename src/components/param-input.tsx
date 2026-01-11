import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { ArrowRight } from "lucide-react"


export function ParamInput() {
  return (
    <div className="grid w-full gap-2 text-left">
      <div className="text-xl font-bold text-gray-800">1. Generation</div>

      <div className="text-xs text-gray-400">
        <div>
          <div className="mb-1">Box length and rectangles settings can be set arbitrarily, but with the following thresholds:</div>
        </div>
        <div><span className="font-semibold">Box length:</span> 1 &ge; L &ge; 10000</div>
        <div><span className="font-semibold">Number of rectangles:</span> 1 &ge; N &ge; 1000</div>
        <div><span className="font-semibold">Width and Height:</span> 1 &ge; W, H &ge; L</div>
      </div>

      <div className="grid gap-2">
        <InputGroup>
          <InputGroupInput type="number" placeholder="70" />
          <InputGroupAddon>
            <Label className="text-gray-700">Box length:</Label>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput type="number" placeholder="10" />
          <InputGroupAddon>
            <Label className="text-gray-700">Number of rectangles:</Label>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput type="text" placeholder="E.g: 20-50" />
          <InputGroupAddon>
            <Label className="text-gray-700">Width range 📐</Label>
          </InputGroupAddon>
        </InputGroup>

        <InputGroup>
          <InputGroupInput type="text" placeholder="E.g: 30-70" />
          <InputGroupAddon>
            <Label className="text-gray-700">Height range📏</Label>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Button className="mt-2" variant='default'><span className="text-sm">Generate instance</span> <ArrowRight /> </Button>
    </div>
  )
}

export default ParamInput
