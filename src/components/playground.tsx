import { useContext } from "react";
import { MainContext } from "@/context/MainContext";

export function Playground() {
    const { solution } = useContext(MainContext) ?? { solution: null };

    const DISPLAY_SIZE = 200; // Fixed display size
    const scale = solution ? DISPLAY_SIZE / solution.L : 1;

    if (!solution) {
        return (
            <div>
                <div className="text-xl font-bold text-gray-800 mb-3">
                    3. Playground
                </div>
                <div className="text-center">Empty (～￣▽￣)～</div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-xl font-bold text-gray-800 mb-3">
                3. Playground
            </div>
            <div className="text-center mb-1">
                <strong>Number of boxes:</strong> {solution.idToBox.size}
            </div>
            <div className="text-center mb-4">
                <strong>Run time:</strong> {solution.getFormattedRunTime()}
            </div>

            <div className="flex flex-wrap gap-1 md:gap-2">
                {Array.from(solution.idToBox.values()).map((box) => (
                    <div
                        key={box.id}
                        className="border-2 border-gray-400 bg-white w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5rem)]"
                    >
                        <svg
                            viewBox={
                                "0 0" + " " + DISPLAY_SIZE + " " + DISPLAY_SIZE
                            }
                            className="border border-gray-300 bg-gray-100 w-full h-auto"
                        >
                            {/* Draw rectangles */}
                            {box.rectangles.map((rect, idx) => (
                                <g key={idx}>
                                    <rect
                                        x={rect.x * scale}
                                        y={rect.y * scale}
                                        width={rect.getWidth * scale}
                                        height={rect.getHeight * scale}
                                        fill={
                                            rect.isSideway
                                                ? "#8b7f73"
                                                : "#c4a17c"
                                        }
                                        stroke="black"
                                        strokeWidth="1"
                                    />
                                    {/* Display rectangle ID in the center */}
                                    <text
                                        x={
                                            rect.x * scale +
                                            (rect.getWidth * scale) / 2
                                        }
                                        y={
                                            rect.y * scale +
                                            (rect.getHeight * scale) / 2
                                        }
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="10"
                                        fontWeight="light"
                                        fill="black"
                                        pointerEvents="none"
                                    >
                                        {rect.id}
                                    </text>
                                </g>
                            ))}
                        </svg>
                        <div className="text-sm text-gray-600">
                            Box {box.id} ({(box.fillRatio * 100).toFixed(2)}%)
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Playground;
