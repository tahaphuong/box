// import { Rectangle } from "@/models/binpacking/Rectangle";
// import { Solution } from "@/models/binpacking";
// import { type Move } from "../Move";
// import { type Neighborhood } from "./Neighborhood";
// import type { ShelfPlacement, Shelf } from "@/core/greedy";

// export class GeometryShelfNeighborhood implements Neighborhood<
//     Rectangle,
//     Solution
// > {
//     // refer to current box
//     numNeighbors: number;
//     totalRectangles: number;

//     constructor(numNeighbors: number, totalRectangles: number) {
//         this.numNeighbors = numNeighbors;
//         this.totalRectangles = totalRectangles;
//     }

//     // Minimize
//     evalShelfToUnpack(sh: Shelf) {
//         const u = sh.util; // low is good
//         const h = sh.height / sh.maxWidth; // low is good
//         const w = sh.currentWidth / sh.maxWidth; // low is good
//         const f = sh.rectangles.length / this.totalRectangles;

//         return (
//             u * u + // strongly prefer low-util shelves
//             h + // avoid tall blockers
//             w + // avoid wide shelves
//             f // prefer fragmented shelves
//         );
//     }

//     // Sort increasing
//     findSortedShelves(placement: ShelfPlacement): Shelf[] {
//         const shelves = Array.from(placement.boxToShelf.values()).flat(1);
//         shelves.sort(
//             (a, b) => this.evalShelfToUnpack(a) - this.evalShelfToUnpack(b),
//         );
//         return shelves;
//     }

//     getAvailableMoves(
//         solution: Solution,
//         placement: ShelfPlacement,
//     ): RelocateRectShelf[] {
//         const sortedShelves = this.findSortedShelves(placement);
//         const neighborShelves = sortedShelves.slice(0, this.numNeighbors); // shelves to unpack

//         for (const sh of neighborShelves) {
//             const sourceRects: Rectangle[] = [...sh.rectangles];

//             const moves: RelocateRectShelf[] = [];
//             for (let i = 0; i < sourceRects.length; i++) {
//                 // document original & wantside
//                 const oriSideway = sourceRects[i].isSideway;
//                 const destShelf = placement.findShelfAndRotate(
//                     sourceRects[i],
//                     solution,
//                 );
//                 const wantSideway = sourceRects[i].isSideway;
//                 // rotate back to original
//                 if (sourceRects[i].isSideway != oriSideway) {
//                     sourceRects[i].isSideway = oriSideway;
//                 }

//                 if (!destShelf) continue;
//                 moves.push(
//                     new RelocateRectShelf(
//                         placement,
//                         sourceRects[i],
//                         sourceShelves[i],
//                         destShelf,
//                         wantSideway,
//                     ),
//                 );
//             }
//         }

//         return moves;
//     }
// }

// // relocate to shelves
// export class RelocateRectShelf implements Move<Solution> {
//     placement: ShelfPlacement;
//     boxToShelf: Map<number, Shelf>;
//     constructor(currentPlacement: ShelfPlacement, boxId: number) {
//     }
//     apply(solution: Solution): Solution {}
//     undo(solution: Solution): Solution {}
// }
