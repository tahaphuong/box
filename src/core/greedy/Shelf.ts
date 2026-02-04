import type { Rectangle } from "@/models/binpacking";

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

    getHeightDiff(rectHeight: number): number {
        return this.height - rectHeight;
    }

    getWidthDiff(rectWidth: number): number {
        return this.maxWidth - this.currentWidth - rectWidth;
    }

    check(rect: Rectangle): boolean {
        return (
            rect.getHeight <= this.height &&
            this.currentWidth + rect.getWidth <= this.maxWidth
        );
    }

    checkAndRotate(item: Rectangle): boolean {
        const isOriginallySideway = item.isSideway;

        // try upright first
        if (item.isSideway) item.setRotate();
        if (this.check(item)) return true;
        item.setRotate();
        if (this.check(item)) return true;

        // restore original orientation if can't fit
        if (item.isSideway != isOriginallySideway) item.setRotate();

        return false;
    }

    calcWasteOrientation(item: Rectangle, wantSideway: boolean): number | null {
        const originalSideway = item.isSideway;

        // Rotate to requested orientation if needed
        if (item.isSideway !== wantSideway) item.setRotate();
        const wd = this.maxWidth - this.currentWidth - item.getWidth;
        const hd = this.height - item.getHeight;

        let waste = null;
        if (wd >= 0 && hd >= 0) {
            waste = wd + hd;
        }

        // Restore original orientation
        if (item.isSideway !== originalSideway) item.setRotate();

        return waste;
    }

    add(rect: Rectangle): boolean {
        this.rectangles.push(rect);

        // update shelf current width
        let curWidth = 0;
        for (const r of this.rectangles) {
            curWidth += r.getWidth;
        }
        this.currentWidth = curWidth;
        // update rect coordinates
        rect.x = curWidth - rect.getWidth;
        rect.y = this.y;

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
