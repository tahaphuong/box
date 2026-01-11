import type { GeneratorConfig } from "@/models";

/**
 * Validate GeneratorConfig parameters based on constraints:
 * Box length: 1 ≤ L ≤ 10000
 * Number of rectangles: 1 ≤ N ≤ 1000
 * Width and Height: 1 ≤ W, H ≤ L
 *
 * @param config - Configuration to validate
 * @returns true if valid, throws error otherwise
 */


export function validateGeneratorConfig(config: GeneratorConfig): boolean {
  // Box length constraint: 1 ≤ L ≤ 10000
  if (config.L < 1 || config.L > 10000) {
    throw new Error('Box length L must be between 1 and 10000');
  }

  // Number of rectangles constraint: 1 ≤ N ≤ 1000
  if (config.numRectangles < 1 || config.numRectangles > 1000) {
    throw new Error('Number of rectangles must be between 1 and 1000');
  }

  // Width constraint: 1 ≤ W ≤ L
  if (config.minWidth < 1 || config.maxWidth > config.L) {
    throw new Error('Width must be between 1 and L (box length)');
  }

  // Length constraint: 1 ≤ H ≤ L
  if (config.minLength < 1 || config.maxLength > config.L) {
    throw new Error('Height must be between 1 and L (box length)');
  }

  // Min max constraints
  if (config.minWidth > config.maxWidth) {
    throw new Error('minWidth must be less than or equal to maxWidth');
  }

  if (config.minLength > config.maxLength) {
    throw new Error('minLength must be less than or equal to maxLength');
  }

  return true;
}

/**
 * Parse input values from UI to GeneratorConfig
 * @param L - Box length as number
 * @param numRectangles - Number of rectangles as number
 * @param widthRange - Width range as string (e.g., "20-50")
 * @param lengthRange - Length range as string (e.g., "30-70")
 * @returns GeneratorConfig object
 * @throws Error if input format is invalid
 */
export function parseInputToConfig(
  L: number | string,
  numRectangles: number | string,
  widthRange: string,
  lengthRange: string
): GeneratorConfig {
  // Parse L
  const parsedL = parseInt(String(L), 10);
  if (isNaN(parsedL)) {
    throw new Error('Box length must be a valid number');
  }

  // Parse numRectangles
  const parsedNumRectangles = parseInt(String(numRectangles), 10);
  if (isNaN(parsedNumRectangles)) {
    throw new Error('Number of rectangles must be a valid number');
  }

  // Parse width range
  const widthParts = widthRange.trim().split('-');
  if (widthParts.length !== 2) {
    throw new Error('Width range must be in format "min-max" (e.g., "20-50")');
  }
  const minWidth = parseInt(widthParts[0].trim(), 10);
  const maxWidth = parseInt(widthParts[1].trim(), 10);
  if (isNaN(minWidth) || isNaN(maxWidth)) {
    throw new Error('Width range values must be valid numbers');
  }

  // Parse length range
  const lengthParts = lengthRange.trim().split('-');
  if (lengthParts.length !== 2) {
    throw new Error('Length range must be in format "min-max" (e.g., "30-70")');
  }
  const minLength = parseInt(lengthParts[0].trim(), 10);
  const maxLength = parseInt(lengthParts[1].trim(), 10);
  if (isNaN(minLength) || isNaN(maxLength)) {
    throw new Error('Length range values must be valid numbers');
  }

  const config: GeneratorConfig = {
    L: parsedL,
    numRectangles: parsedNumRectangles,
    minWidth,
    maxWidth,
    minLength,
    maxLength,
  };

  // Validate the configuration
  validateGeneratorConfig(config);

  return config;
}
