import { type GeneratorConfig, Instance, Rectangle } from "@/models"
/**
 * Generate a random instance with specified parameter
 * @param config - Configuration for each instance
 */
export function generateInstance(config: GeneratorConfig): Instance {
  const { L, numRectangles, minWidth, maxWidth, minLength, maxLength } = config;

  const rectangles: Rectangle[] = [];

  for (let i = 0; i < numRectangles; i++) {
    const randomWidth = Math.ceil(Math.random() * (maxWidth - minWidth + 1) + minWidth);
    const randomLength = Math.ceil(Math.random() * (maxLength - minLength + 1) + minLength);
    rectangles.push(new Rectangle(randomWidth, randomLength));
  }

  return new Instance(L, rectangles);
}

/**
 * Generate multiple instances
 * @param count - Number of instances to generate
 * @param config - Configuration for each instance
 * @returns Array of Instance objects
 */
export function generateInstances(count: number, config: GeneratorConfig): Instance[] {
  return Array.from({ length: count }, () => generateInstance(config));
}
