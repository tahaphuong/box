import { type GeneratorConfig, TestInstance, Rectangle } from "@/models"
/**
 * Generate a random instance with specified parameter
 * @param config - Configuration for each instance
 */
export function generateInstance(config: GeneratorConfig): TestInstance {
  const { L, numRectangles, minWidth, maxWidth, minLength, maxLength } = config;

  const rectangles: Rectangle[] = [];

  for (let i = 0; i < numRectangles; i++) {
    const randomWidth = Math.ceil(Math.random() * (maxWidth - minWidth + 1) + minWidth);
    const randomLength = Math.ceil(Math.random() * (maxLength - minLength + 1) + minLength);
    rectangles.push(new Rectangle(randomWidth, randomLength));
  }

  return new TestInstance(L, rectangles);
}

/**
 * Generate multiple instances
 * @param count - Number of instances to generate
 * @param config - Configuration for each instance
 * @returns Array of Instance objects
 */
export function generateInstances(count: number, config: GeneratorConfig): TestInstance[] {
  return Array.from({ length: count }, () => generateInstance(config));
}
