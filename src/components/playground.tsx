import { useContext } from "react"
import { MainContext } from "@/App"

export function Playground() {
  const { solution } = useContext(MainContext) ?? { solution: null };

  const DISPLAY_SIZE = 200; // Fixed display size
  const scale = solution ? DISPLAY_SIZE / solution.L : 1;

  if (!solution) {
    return (
      <div>
        <div className="text-xl font-bold text-gray-800 mb-3">3. Playground</div>
        <div className="text-center">Empty (～￣▽￣)～</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xl font-bold text-gray-800 mb-3">3. Playground</div>
      <div className="text-center mb-4">Number of boxes: {solution.boxes.length}</div>

      <div className="flex flex-wrap gap-6">
        {solution.boxes.map((box) => (
          <div key={box.id} className="border-2 border-gray-400 bg-white">
            <svg
              width={DISPLAY_SIZE}
              height={DISPLAY_SIZE}
              className="border border-gray-300 bg-gray-100"
            >
              {/* Draw rectangles */}
              {box.rectangles.map((rect, idx) => (
                <rect
                  key={idx}
                  x={rect.x * scale}
                  y={rect.y * scale}
                  width={rect.getWidth * scale}
                  height={rect.getHeight * scale}
                  fill={rect.isSideway ? "#8b7f73" : "#f5f5dc"}
                  stroke="black"
                  strokeWidth="1"
                />
              ))}
            </svg>
            <div className="text-sm text-gray-600">Box {box.id} ({box.rectangles.length} items)</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Playground
