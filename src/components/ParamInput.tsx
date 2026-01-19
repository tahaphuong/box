import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { useState, useContext } from "react"

import { parseInputToConfig, generateInstance } from "@/handlers"
import { MainContext } from "@/App"

export function ParamInput() {
  const [L, setL] = useState<string>("200")
  const [numRect, setNumRectangles] = useState<string>("1000")
  const [widthRange, setWidthRange] = useState<string>("20-200")
  const [heightRange, setHeightRange] = useState<string>("20-200")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { setInstance } = useContext(MainContext) || {};

  const handleGenerate = () => {
    try {
      const config = parseInputToConfig(L, numRect, widthRange, heightRange)
      let instance = generateInstance(config)
      if (setInstance) {
        setInstance(instance)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input")
    } finally {
      setIsLoading(false)
    }
  }

  const onClickGenerate = () => {
    setIsLoading(true);
    setError("");

    setTimeout(() => handleGenerate(), 0);
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
            value={numRect}
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
            value={heightRange}
            onChange={(e) => setHeightRange(e.target.value)}
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
        className={`mt-2 ${isLoading ? "opacity-50" : "opacity-100"}`}
        variant='default'
        onClick={onClickGenerate}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
        <span className="text-sm">{isLoading ? "Generating..." : "Generate instance"}</span>
      </Button>
    </div>
  )
}

export default ParamInput

