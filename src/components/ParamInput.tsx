import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState, useContext } from "react"

import { parseInputToConfig, generateInstance } from "@/logic"
import { MainContext } from "@/App"

export function ParamInput() {
  const [L, setL] = useState<string>("70")
  const [numRectangles, setNumRectangles] = useState<string>("10")
  const [widthRange, setWidthRange] = useState<string>("20-50")
  const [lengthRange, setLengthRange] = useState<string>("30-70")
  const [error, setError] = useState<string>("")

  const { setInstance } = useContext(MainContext) || {};

  const handleGenerate = () => {
    try {
      setError("")
      const config = parseInputToConfig(L, numRectangles, widthRange, lengthRange)
      let instance = generateInstance(config)
      if (setInstance) {
        setInstance(instance)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input")
    }
  }

  return (
    <div className="grid w-full gap-2 text-left">
      <div className="text-xl font-bold text-gray-800">1. Generation</div>

      <div className="text-xs text-gray-400">
        <div>
          <div className="mb-1">Box length and rectangles settings can be set arbitrarily, but with the following thresholds:</div>
        </div>
        <div><span className="font-semibold">Box length:</span> 1 ≤ L ≤ 10000</div>
        <div><span className="font-semibold">Number of rectangles:</span> 1 ≤ N ≤ 1000</div>
        <div><span className="font-semibold">Width and Height:</span> 1 ≤ W, H ≤ L</div>
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
            value={numRectangles}
            onChange={(e) => setNumRectangles(e.target.value)}
          />
          <InputGroupAddon>
            <Label className="text-gray-700">Number of rectangles:</Label>
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
            value={lengthRange}
            onChange={(e) => setLengthRange(e.target.value)}
          />
          <InputGroupAddon>
            <Label className="text-gray-700">Height range📏</Label>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {error && (
        <div className="text-xs text-red-500 mt-2">{error}</div>
      )}

      <Button
        className="mt-2"
        variant='default'
        onClick={handleGenerate}
      >
        <span className="text-sm">Generate instance</span> <ArrowRight />
      </Button>
    </div>
  )
}

export default ParamInput

