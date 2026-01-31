export class Rectangle {
    // INIT: required values for INIT
    readonly id: number;
    private readonly width: number;
    private readonly height: number;
    readonly area: number;

    // SOLUTION: default to false and -1 when INIT
    isSideway: boolean;
    rotated: boolean;
    x: number;
    y: number;
    boxId: number;

    constructor(id: number, width: number, height: number) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.area = width * height;

        this.isSideway = this.width >= this.height;
        this.rotated = false;
        this.x = -1;
        this.y = -1;
        this.boxId = -1;
    }

    reset() {
        this.isSideway = this.width >= this.height;
        this.rotated = false;
        this.x = -1;
        this.y = -1;
        this.boxId = -1;
    }

    // GETTERS
    getLargerSide(): number {
        return Math.max(this.width, this.height);
    }
    getSmallerSide(): number {
        return Math.min(this.width, this.height);
    }

    get getWidth(): number {
        return this.rotated ? this.height : this.width;
    }
    get getHeight(): number {
        return this.rotated ? this.width : this.height;
    }

    // SETTERS
    setRotate() {
        this.rotated = !this.rotated;
        this.isSideway = !this.isSideway;
    }
    setBoxId(boxId: number) {
        this.boxId = boxId;
        return this; // Method chaining?
    }
}
