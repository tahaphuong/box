import { type GeneratorConfig, Instance, Rectangle } from "@/models/binpacking"

export function generateInstance(config: GeneratorConfig): Instance {
  const { L, numRect, minW, maxW, minH, maxH } = config;

  const rectangles: Rectangle[] = [];

  for (let i = 0; i < numRect; i++) {
    const randomWidth = Math.ceil(Math.random() * (maxW - minW + 1) + minW);
    const randomLength = Math.ceil(Math.random() * (maxH - minH + 1) + minH);
    rectangles.push(new Rectangle(i, randomWidth, randomLength));
  }

  return new Instance(L, rectangles);
}

export function generateManyInstance(count: number, config: GeneratorConfig): Instance[] {
  return Array.from({ length: count }, () => generateInstance(config));
}
