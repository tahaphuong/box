import type { GeneratorConfig } from "@/models/binpacking";

export function validateGeneratorConfig(config: GeneratorConfig): boolean {
    if (config.L < 1 || config.L > 10000) {
        throw new Error("Box length L must be between 1 and 10000");
    }

    if (config.numRect < 1 || config.numRect > 10000) {
        throw new Error("Number of rectangles must be between 1 and 10000");
    }

    if (config.minW < 1 || config.maxW > config.L) {
        throw new Error("Width must be between 1 and L (box length)");
    }

    if (config.minH < 1 || config.maxH > config.L) {
        throw new Error("Height must be between 1 and L (box length)");
    }

    if (config.minW > config.maxW) {
        throw new Error("Min width must be less than or equal to max width");
    }

    if (config.minH > config.maxH) {
        throw new Error("Min height must be less than or equal to max height");
    }

    return true;
}

function parseRange(side: string, range: string): [number, number] {
    const parts = range.trim().split("-");
    if (parts.length !== 2) {
        throw new Error(
            side + ' range must be in format "min-max" (e.g., "30-70")',
        );
    }
    const minSide = parseInt(parts[0].trim(), 10);
    const maxSide = parseInt(parts[1].trim(), 10);
    if (isNaN(minSide) || isNaN(maxSide)) {
        throw new Error(side + " range values must be valid numbers");
    }
    return [minSide, maxSide];
}

export function parseInputToConfig(
    L: number | string,
    numRect: number | string,
    widthRange: string,
    heightRange: string,
): GeneratorConfig {
    const parsedL = parseInt(String(L), 10);
    if (isNaN(parsedL)) {
        throw new Error("Box length must be a valid number");
    }

    const parsedNumRectangles = parseInt(String(numRect), 10);
    if (isNaN(parsedNumRectangles)) {
        throw new Error("Number of rectangles must be a valid number");
    }

    const [minW, maxW] = parseRange("Width", widthRange);
    const [minH, maxH] = parseRange("Height", heightRange);

    const config: GeneratorConfig = {
        L: parsedL,
        numRect: parsedNumRectangles,
        minW,
        maxW,
        minH,
        maxH,
    };

    // Validate the configuration
    validateGeneratorConfig(config);

    return config;
}
