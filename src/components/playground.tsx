import { useContext } from "react"
import { MainContext } from "@/App"

export function Playground() {
  const { solution } = useContext(MainContext) ?? { solution: null };

  return (
    <div>
      <div className="text-xl font-bold text-gray-800 mb-3">3. Playground</div>

      <div className="text-center">{!solution ? "Empty (～￣▽￣)～" : "Number of boxes: " + solution.boxes.length}</div>
    </div>
  )
}

export default Playground
