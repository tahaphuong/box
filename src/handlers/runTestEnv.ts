import type { GeneratorConfig } from "@/models/binpacking";

const smallConfig: GeneratorConfig = {
    L: 100,
    numRect: 100,
    minW: 10,
    maxW: 50,
    minH: 20,
    maxH: 100,
};

const largeConfig: GeneratorConfig = {
    L: 1000,
    numRect: 10000,
    minW: 10,
    maxW: 1000,
    minH: 20,
    maxH: 1000,
};

void smallConfig;
void largeConfig;

// args: bun run runTestEnv.ts small/large

// handle args
// const env = Bun.argv[0];
// if (env === "small") {
//     runTest(smallConfig);
// } else if (env === "large") {
//     runTest(largeConfig);
// } else {
//     console.error("Invalid environment");
// }

// function runTest(config: GeneratorConfig) {
//     void config;
// }
