// Ambient test runner definitions for TypeScript type checking

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void): void;
declare function expect(actual: any): {
  toBe(expected: any): void;
  toBeTruthy(): void;
  toBeGreaterThan(expected: number): void;
};
