import type { Rectangle } from "@/models/binpacking";
import { create } from "mutative";

export class Shelf {
    readonly maxWidth: number;
    readonly boxId: number;

    y: number; // position of shelf in box
    height: number;
    currentWidth: number;
    rectangles: Rectangle[];

    constructor(y: number, height: number, maxWidth: number, boxId: number) {
        this.maxWidth = maxWidth;
        this.boxId = boxId;
        this.y = y;
        this.height = height;

        this.currentWidth = 0;
        this.rectangles = [];
    }

    get util() {
        let util = 0;
        for (const rect of this.rectangles) {
            util += rect.area;
        }
        return util / (this.maxWidth * this.height);
    }

    calcWasteOrientation(item: Rectangle, wantSideway: boolean): number | null {
        const originalSideway = item.isSideway;

        // Rotate to requested orientation if needed
        item.isSideway = wantSideway;
        const wd = this.maxWidth - this.currentWidth - item.getWidth;
        const hd = this.height - item.getHeight;

        if (wd >= 0 && hd >= 0) {
            item.isSideway = originalSideway;
            return wd + hd;
        }
        return null;
    }

    getNextPosition(): { x: number; y: number } {
        // update shelf current width
        let curWidth = 0;
        for (const r of this.rectangles) {
            curWidth += r.getWidth;
        }
        this.currentWidth = curWidth;
        return { x: curWidth, y: this.y };
    }

    add(rect: Rectangle, pos?: { x: number; y: number }): boolean {
        const { x, y } = pos ? pos : this.getNextPosition();
        // update rect coordinates
        rect.x = x;
        rect.y = y;
        this.rectangles.push(rect);
        this.currentWidth += rect.getWidth;
        return true;
    }

    remove(rect: Rectangle): boolean {
        const index = this.rectangles.indexOf(rect);
        if (index === -1)
            throw new Error(`Rect ${rect.id} is not in shelf ${this}`);
        this.rectangles.splice(index, 1);

        // update rects x and shelf current width
        let curWidth = 0;
        for (const r of this.rectangles) {
            r.x = curWidth;
            curWidth += r.getWidth;
        }
        this.currentWidth = curWidth;

        // update shelf height
        if (this.height == rect.getHeight) {
            let curBestHeight = 0;
            for (const r of this.rectangles) {
                if (r.getHeight > curBestHeight) curBestHeight = r.getHeight;
            }
            this.height = curBestHeight;
        }

        return true;
    }
}
