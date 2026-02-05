export class Rectangle {
    // INIT: required values for INIT
    readonly id: number;
    private readonly width: number;
    private readonly height: number;
    readonly area: number;
    readonly smallerSide: number;
    readonly largerSide: number;

    // SOLUTION: default to false and -1 when INIT
    isSideway: boolean;
    x: number;
    y: number;
    boxId: number;

    constructor(id: number, width: number, height: number) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.area = width * height;
        this.smallerSide = Math.min(width, height);
        this.largerSide = Math.max(width, height);

        this.isSideway = this.width >= this.height;
        this.x = -1;
        this.y = -1;
        this.boxId = -1;
    }

    reset() {
        this.isSideway = this.width >= this.height;
        this.x = -1;
        this.y = -1;
        this.boxId = -1;
    }

    get getWidth(): number {
        return this.isSideway ? this.largerSide : this.smallerSide;
    }
    get getHeight(): number {
        return this.isSideway ? this.smallerSide : this.largerSide;
    }

    // Non-mutating helpers to query dimensions for a given orientation
    getWidthWith(isSideway: boolean): number {
        return isSideway ? this.largerSide : this.smallerSide;
    }
    getHeightWith(isSideway: boolean): number {
        return isSideway ? this.smallerSide : this.largerSide;
    }
}
