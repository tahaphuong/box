import type { Rectangle } from "@/models/binpacking";

export class Shelf {
    readonly width: number;

    y: number; // position of shelf in box
    height: number;
    currentWidth: number;
    rectangles: Rectangle[];
    // skyline space (height, width)
    // skylines: { x: number; h: number; w: number }[];

    constructor(y: number, height: number, width: number) {
        this.y = y;
        this.height = height;
        this.width = width;

        this.currentWidth = 0;
        this.rectangles = [];

        // skyline x-coord & space (x, height, width).
        // Exclude the last "trivial" skyline [this.height, this.width]
        // this.skylines = [];
    }

    getHeightDiff(rectHeight: number): number {
        return this.height - rectHeight;
    }

    getWidthDiff(rectWidth: number): number {
        return this.width - this.currentWidth - rectWidth;
    }

    check(rect: Rectangle): boolean {
        return (
            rect.getHeight <= this.height &&
            this.currentWidth + rect.getWidth <= this.width
        );
    }

    add(rect: Rectangle): boolean {
        rect.x = this.currentWidth;
        rect.y = this.y;

        this.currentWidth = this.currentWidth + rect.getWidth;
        this.rectangles.push(rect);
        return true;
    }

    revertAdd(
        rect: Rectangle,
        oldX: number,
        oldY: number,
        oldRotated: boolean,
    ): boolean {
        this.currentWidth -= rect.getWidth;
        rect.x = oldX;
        rect.y = oldY;
        if (rect.rotated !== oldRotated) {
            rect.setRotate();
        }
        this.rectangles.pop();
        return true;
    }

    remove(rect: Rectangle): number {
        // position in shelf
        const index = this.rectangles.indexOf(rect);
        if (index === -1) return -1;

        // remove rect from rectangles array & update current width
        this.rectangles.splice(index, 1);

        if (this.rectangles.length == 0) {
            this.currentWidth = 0;
            this.height = 0;
            return 0; // has no more rectangles
        }

        // update shelf currentWidth
        this.currentWidth -= rect.getWidth;

        // update rectangles x
        for (let i = index; i < this.rectangles.length; i++) {
            this.rectangles[i].x -= rect.getWidth;
        }

        // update shelf height
        if (this.height == rect.getHeight) {
            let curBestHeight = 0;
            for (const r of this.rectangles) {
                if (r.getHeight > curBestHeight) curBestHeight = r.getHeight;
            }
            this.height = curBestHeight;
        }
        return index;
    }
}

// TODO: Needs fix
//
// findSkyline(rect: Rectangle, bestFit: boolean = false): number | null {
//     let bestIndex = null;

//     for (let i = 0; i < this.skylines.length; i++) {
//         // TODO: check cho nay kho' vkl (╯°□°）╯︵ ┻━┻
//         if (this.skylines[i].h >= rect.getHeight) {
//             if (!bestFit) return i;
//             // findbestHeightFit
//             if (
//                 bestIndex == null ||
//                 this.skylines[i].h < this.skylines[bestIndex].h
//             ) {
//                 bestIndex = i;
//             }
//         }
//     }

//     // first fit not found
//     if (!bestFit) {
//         return null;
//     }
//     return bestIndex;
// }

// addRectSkyline(rect: Rectangle, index: number | null): boolean {
//     if (index == null) return false;

//     // add to left, edit width of current skyline, then add new skyline
//     const newSkyline = {
//         x: this.skylines[index].x,
//         h: this.skylines[index].h - rect.getHeight,
//         w: rect.getWidth,
//     };
//     this.skylines[index].x += rect.getWidth; // move to right
//     this.skylines[index].w -= rect.getWidth; // reduce width
//     this.skylines.splice(index, 0, newSkyline);

//     rect.x = newSkyline.x;
//     rect.y = this.y + newSkyline.h;

//     this.rectangles.push(rect);
//     return true;
// }

// removeRectangle(rect: Rectangle): boolean {
//     const index = this.rectangles.indexOf(rect); // TODO: Beware of copy
//     if (index === -1) return false;

//     for (let i = 0; i < this.skylines.length; i++) {
//         if (this.skylines) this.skylines[i].w += rect.getWidth;
//     }

//     const skyline = this.skylines[index];
//     const newSkyline = {
//         x: skyline.x,
//         h: skyline.h + rect.getHeight,
//         w: skyline.w + rect.getWidth,
//     };
//     this.skylines.splice(index, 1, newSkyline);

//     this.rectangles.splice(index, 1);
//     return true;
// }
