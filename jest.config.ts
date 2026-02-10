import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    // The build pipeline generates `build/package.json`, which can cause a haste-map
    // naming collision with the repo root `package.json` if tests are run after builds.
    modulePathIgnorePatterns: ['<rootDir>/build/'],
    testPathIgnorePatterns: ['<rootDir>/build/'],
    watchPathIgnorePatterns: ['<rootDir>/build/'],
}

export default config;
