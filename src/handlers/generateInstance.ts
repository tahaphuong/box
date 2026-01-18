import { type GeneratorConfig, Instance, Rectangle } from "@/models"

export function generateInstance(config: GeneratorConfig): Instance {
  const { L, numRect, minW, maxW, minL, maxL } = config;

  const rectangles: Rectangle[] = [];

  for (let i = 0; i < numRect; i++) {
    const randomWidth = Math.ceil(Math.random() * (maxW - minW + 1) + minW);
    const randomLength = Math.ceil(Math.random() * (maxL - minL + 1) + minL);
    rectangles.push(new Rectangle(i, randomWidth, randomLength));
  }

  return new Instance(L, rectangles);
}

export function generateManyInstance(count: number, config: GeneratorConfig): Instance[] {
  return Array.from({ length: count }, () => generateInstance(config));
}
