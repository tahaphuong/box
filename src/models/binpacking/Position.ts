export interface Position {
    boxId: number;
    x: number;
    y: number;
    isSideway: boolean;

    // for shelf relocation
    shelfIndex?: number; // -1 means new shelf in boxId
}
