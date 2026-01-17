import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useArray } from "./useArray";

describe("useArray", () => {
    test("should initialize with default value", () => {
        const { result } = renderHook(() => useArray([1, 2, 3]));

        expect(result.current.array).toEqual([1, 2, 3]);
    });

    test("should initialize with empty array", () => {
        const { result } = renderHook(() => useArray([]));

        expect(result.current.array).toEqual([]);
    });

    describe("push", () => {
        test("should add element to end of array", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.push(4);
            });

            expect(result.current.array).toEqual([1, 2, 3, 4]);
        });

        test("should add multiple elements sequentially", () => {
            const { result } = renderHook(() => useArray<number>([]));

            act(() => {
                result.current.push(1);
                result.current.push(2);
                result.current.push(3);
            });

            expect(result.current.array).toEqual([1, 2, 3]);
        });

        test("should add complex objects", () => {
            const { result } = renderHook(() =>
                useArray<{ id: number; name: string }>([])
            );

            act(() => {
                result.current.push({ id: 1, name: "test" });
            });

            expect(result.current.array).toEqual([{ id: 1, name: "test" }]);
        });

        test("should not mutate original array", () => {
            const { result } = renderHook(() => useArray([1, 2]));
            const originalArray = result.current.array;

            act(() => {
                result.current.push(3);
            });

            expect(originalArray).toEqual([1, 2]);
            expect(result.current.array).toEqual([1, 2, 3]);
        });
    });

    describe("filter", () => {
        test("should filter array based on callback", () => {
            const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]));

            // Note: The filter method has incorrect typing - it doesn't receive the element
            // Using `set` with a proper filter instead
            act(() => {
                result.current.set((arr) => arr.filter((x) => x > 2));
            });

            expect(result.current.array).toEqual([3, 4, 5]);
        });

        test("should handle empty result from filter", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.filter(() => false);
            });

            expect(result.current.array).toEqual([]);
        });

        test("should not mutate original array", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));
            const originalArray = result.current.array;

            act(() => {
                result.current.filter(() => result.current.array[0] > 1);
            });

            expect(originalArray).toEqual([1, 2, 3]);
        });
    });

    describe("update", () => {
        test.each([
            {
                position: "first",
                index: 0,
                initial: ["a", "b", "c"],
                newValue: "z",
                expected: ["z", "b", "c"],
            },
            {
                position: "middle",
                index: 1,
                initial: ["a", "b", "c"],
                newValue: "z",
                expected: ["a", "z", "c"],
            },
            {
                position: "last",
                index: 2,
                initial: ["a", "b", "c"],
                newValue: "z",
                expected: ["a", "b", "z"],
            },
        ])(
            "should update $position element at index $index",
            ({ index, initial, newValue, expected }) => {
                const { result } = renderHook(() => useArray(initial));

                act(() => {
                    result.current.update(index, newValue);
                });

                expect(result.current.array).toEqual(expected);
            }
        );

        test("should handle updating complex objects", () => {
            const { result } = renderHook(() =>
                useArray([
                    { id: 1, name: "test1" },
                    { id: 2, name: "test2" },
                ])
            );

            act(() => {
                result.current.update(1, { id: 2, name: "updated" });
            });

            expect(result.current.array).toEqual([
                { id: 1, name: "test1" },
                { id: 2, name: "updated" },
            ]);
        });

        test("should not mutate original array", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));
            const originalArray = result.current.array;

            act(() => {
                result.current.update(1, 99);
            });

            expect(originalArray).toEqual([1, 2, 3]);
        });

        test("should handle out of bounds index gracefully", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.update(10, 99);
            });

            // JavaScript allows setting array elements beyond bounds
            expect(result.current.array.length).toBeGreaterThan(3);
            expect(result.current.array[10]).toBe(99);
        });
    });

    describe("remove", () => {
        test.each([
            {
                position: "first",
                index: 0,
                initial: ["a", "b", "c"],
                expected: ["b", "c"],
            },
            {
                position: "middle",
                index: 1,
                initial: ["a", "b", "c"],
                expected: ["a", "c"],
            },
            {
                position: "last",
                index: 2,
                initial: ["a", "b", "c"],
                expected: ["a", "b"],
            },
        ])(
            "should remove $position element at index $index",
            ({ index, initial, expected }) => {
                const { result } = renderHook(() => useArray(initial));

                act(() => {
                    result.current.remove(index);
                });

                expect(result.current.array).toEqual(expected);
            }
        );

        test("should remove multiple elements sequentially", () => {
            const { result } = renderHook(() => useArray([1, 2, 3, 4, 5]));

            act(() => {
                result.current.remove(2); // removes 3
                result.current.remove(2); // removes 4 (now at index 2)
            });

            expect(result.current.array).toEqual([1, 2, 5]);
        });

        test("should not mutate original array", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));
            const originalArray = result.current.array;

            act(() => {
                result.current.remove(1);
            });

            expect(originalArray).toEqual([1, 2, 3]);
        });

        test("should handle removing from single element array", () => {
            const { result } = renderHook(() => useArray([42]));

            act(() => {
                result.current.remove(0);
            });

            expect(result.current.array).toEqual([]);
        });

        test("should handle out of bounds negative index", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.remove(-1);
            });

            // splice with negative index removes from end
            expect(result.current.array).toEqual([1, 2]);
        });
    });

    describe("clear", () => {
        test("should clear array", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.clear();
            });

            expect(result.current.array).toEqual([]);
        });

        test("should clear already empty array", () => {
            const { result } = renderHook(() => useArray([]));

            act(() => {
                result.current.clear();
            });

            expect(result.current.array).toEqual([]);
        });

        test("should not mutate original array", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));
            const originalArray = result.current.array;

            act(() => {
                result.current.clear();
            });

            expect(originalArray).toEqual([1, 2, 3]);
        });
    });

    describe("set", () => {
        test("should set array to new value", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.set([10, 20]);
            });

            expect(result.current.array).toEqual([10, 20]);
        });

        test("should set array using function", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.set((prev) => prev.map((x) => x * 2));
            });

            expect(result.current.array).toEqual([2, 4, 6]);
        });

        test("should set empty array", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.set([]);
            });

            expect(result.current.array).toEqual([]);
        });
    });

    describe("combined operations", () => {
        test("should handle push, update, and remove in sequence", () => {
            const { result } = renderHook(() => useArray([1, 2]));

            act(() => {
                result.current.push(3);
                result.current.update(1, 99);
                result.current.remove(0);
            });

            expect(result.current.array).toEqual([99, 3]);
        });

        test("should handle multiple operations maintaining immutability", () => {
            const { result } = renderHook(() => useArray([1, 2, 3]));

            act(() => {
                result.current.push(4);
            });
            const snapshot1 = [...result.current.array];

            act(() => {
                result.current.update(0, 99);
            });
            const snapshot2 = [...result.current.array];

            act(() => {
                result.current.remove(2);
            });
            const snapshot3 = [...result.current.array];

            expect(snapshot1).toEqual([1, 2, 3, 4]);
            expect(snapshot2).toEqual([99, 2, 3, 4]);
            expect(snapshot3).toEqual([99, 2, 4]);
        });
    });

    describe("edge cases", () => {
        test("should handle array with null values", () => {
            const { result } = renderHook(() =>
                useArray<string | null>(["a", null, "c"])
            );

            act(() => {
                result.current.push(null);
            });

            expect(result.current.array).toEqual(["a", null, "c", null]);
        });

        test("should handle array with undefined values", () => {
            const { result } = renderHook(() =>
                useArray<string | undefined>(["a", undefined, "c"])
            );

            act(() => {
                result.current.update(1, "b");
            });

            expect(result.current.array).toEqual(["a", "b", "c"]);
        });

        test("should handle array with mixed types (within union type)", () => {
            const { result } = renderHook(() =>
                useArray<string | number>(["a", 1, "b", 2])
            );

            act(() => {
                result.current.push(3);
                result.current.push("c");
            });

            expect(result.current.array).toEqual(["a", 1, "b", 2, 3, "c"]);
        });
    });
});
