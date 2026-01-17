import { type MockInstance, vi } from "vitest";

type ConsoleMethod = "log" | "warn" | "error" | "debug";

interface ConsoleSpy {
    spy: MockInstance;
    restore: () => void;
}

/**
 * Suppresses a console method for the duration of a test.
 * Use this when testing code that intentionally logs to console.
 *
 * @example
 * ```typescript
 * test("should handle error gracefully", () => {
 *     const { spy, restore } = suppressConsole("error");
 *
 *     // Action that triggers console.error
 *     triggerError();
 *
 *     expect(spy).toHaveBeenCalledWith(expect.stringContaining("error"));
 *     restore();
 * });
 * ```
 */
export function suppressConsole(method: ConsoleMethod): ConsoleSpy {
    const spy = vi.spyOn(console, method).mockImplementation(() => {
        // Intentionally empty - suppresses console output
    });
    return {
        spy,
        restore: () => spy.mockRestore(),
    };
}

/**
 * Wrapper to run code with suppressed console output.
 * Automatically restores console methods after execution.
 *
 * @example
 * ```typescript
 * test("should handle multiple errors", async () => {
 *     await withSuppressedConsole(["error", "warn"], () => {
 *         // Code that triggers console.error and console.warn
 *         triggerErrors();
 *     });
 * });
 * ```
 */
export async function withSuppressedConsole<T>(
    methods: ConsoleMethod[],
    fn: () => T | Promise<T>
): Promise<T> {
    const spies = methods.map((method) => suppressConsole(method));
    try {
        return await fn();
    } finally {
        spies.forEach((s) => s.restore());
    }
}
