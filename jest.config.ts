import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    testPathIgnorePatterns: [
        '/node_modules/',
        '/src/app/app.component.spec.ts',
        '/src/app/shared/components/'
    ]
}

export default config;
