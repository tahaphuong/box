import { Rectangle } from ".";

export class Box {
    readonly id: number;
    readonly L: number;
    readonly area: number;

    fillArea: number;
    rectangles: Rectangle[]; // list rectangles in this box

    constructor(id: number, L: number) {
        this.id = id;
        this.L = L;
        this.area = L * L;

        this.fillArea = 0;
        this.rectangles = [];
    }

    get areaLeft(): number {
        return this.area - this.fillArea;
    }

    addRectangle(rect: Rectangle): void {
        this.rectangles.push(rect);
        this.fillArea += rect.area;
    }

    removeRectangle(rect: Rectangle): void {
        const i = this.rectangles.findIndex((r) => r.id === rect.id);
        if (i !== -1) this.rectangles.splice(i, 1);
        this.fillArea -= rect.area;
        rect.reset();
    }

    get fillRatio(): number {
        if (this.area == 0) return 0;
        return this.fillArea / this.area;
    }
}
