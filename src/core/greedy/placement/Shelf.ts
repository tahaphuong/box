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

    getNextPosition(): { x: number; y: number } {
        // update shelf current width
        let curWidth = 0;
        for (const r of this.rectangles) {
            curWidth += r.getWidth;
        }
        this.currentWidth = curWidth;
        return { x: curWidth, y: this.y };
    }

    calcWasteOrientation(rect: Rectangle, wantSideway: boolean): number {
        const originalSideway = rect.isSideway;

        // Rotate to requested orientation if needed
        rect.isSideway = wantSideway;
        const wd = this.maxWidth - this.currentWidth - rect.getWidth;
        const hd = this.height - rect.getHeight;

        if (wd >= 0 && hd >= 0) {
            rect.isSideway = originalSideway;
            return wd + hd;
        }
        return -1;
    }

    check(rect: Rectangle, wantSideway: boolean): boolean {
        const originalSideway = rect.isSideway;
        rect.isSideway = wantSideway;

        const fit =
            this.maxWidth - this.currentWidth - rect.getWidth >= 0 &&
            this.height - rect.getHeight >= 0;

        rect.isSideway = originalSideway;
        return fit;
    }

    add(rect: Rectangle, pos?: { x: number; y: number }): void {
        const { x, y } = pos ? pos : this.getNextPosition();
        // update rect coordinates
        rect.x = x;
        rect.y = y;
        this.rectangles.push(rect);
        this.currentWidth += rect.getWidth;
    }

    remove(rect: Rectangle): boolean {
        const index = this.rectangles.findIndex((r) => r.id === rect.id);
        if (index === -1) return false;
        // throw new Error(`Rect ${rect.id} is not in shelf ${this}`);
        this.rectangles.splice(index, 1);
        return true;
    }

    compact(rect?: Rectangle): void {
        // slide the remaining rectangles in
        // and update x & shelf current width
        let curWidth = 0;
        for (const r of this.rectangles) {
            r.x = curWidth;
            curWidth += r.getWidth;
        }
        this.currentWidth = curWidth;

        // update shelf current height
        // skip update if rect is smaller than shelf height
        if (rect && rect.getHeight < this.height) return;

        let curBestHeight = 0;
        for (const r of this.rectangles) {
            if (r.getHeight > curBestHeight) curBestHeight = r.getHeight;
        }
        this.height = curBestHeight;
    }
}
