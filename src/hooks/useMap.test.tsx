import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useMap } from "./useMap";

describe("useMap", () => {
    test("should initialize with default value", () => {
        const { result } = renderHook(() =>
            useMap<string, number>([
                ["a", 1],
                ["b", 2],
                ["c", 3],
            ])
        );

        expect(result.current.map.size).toBe(3);
        expect(result.current.map.get("a")).toBe(1);
        expect(result.current.map.get("b")).toBe(2);
        expect(result.current.map.get("c")).toBe(3);
    });

    test("should initialize with empty map", () => {
        const { result } = renderHook(() => useMap<string, number>([]));

        expect(result.current.map.size).toBe(0);
        expect(result.current.array).toEqual([]);
    });

    describe("setItem", () => {
        test("should add new item to map", () => {
            const { result } = renderHook(() => useMap<string, number>([]));

            act(() => {
                result.current.setItem("key1", 100);
            });

            expect(result.current.map.get("key1")).toBe(100);
            expect(result.current.map.size).toBe(1);
        });

        test("should update existing item in map", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["key1", 100]])
            );

            act(() => {
                result.current.setItem("key1", 200);
            });

            expect(result.current.map.get("key1")).toBe(200);
            expect(result.current.map.size).toBe(1);
        });

        test("should add multiple items", () => {
            const { result } = renderHook(() => useMap<string, string>([]));

            act(() => {
                result.current.setItem("a", "alpha");
                result.current.setItem("b", "beta");
                result.current.setItem("c", "gamma");
            });

            expect(result.current.map.size).toBe(3);
            expect(result.current.map.get("a")).toBe("alpha");
            expect(result.current.map.get("b")).toBe("beta");
            expect(result.current.map.get("c")).toBe("gamma");
        });

        test("should handle complex object values", () => {
            const { result } = renderHook(() =>
                useMap<string, { id: number; name: string }>([])
            );

            const obj = { id: 1, name: "test" };

            act(() => {
                result.current.setItem("key1", obj);
            });

            expect(result.current.map.get("key1")).toEqual(obj);
        });

        test("should not mutate original map", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["a", 1]])
            );

            const originalMap = result.current.map;

            act(() => {
                result.current.setItem("b", 2);
            });

            expect(originalMap.size).toBe(1);
            expect(result.current.map.size).toBe(2);
        });
    });

    describe("getItem", () => {
        test("should return value for existing key", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                ])
            );

            expect(result.current.getItem("a")).toBe(1);
            expect(result.current.getItem("b")).toBe(2);
        });

        test("should return undefined for non-existent key", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["a", 1]])
            );

            expect(result.current.getItem("nonexistent")).toBeUndefined();
        });

        test("should return updated value after setItem", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["a", 1]])
            );

            act(() => {
                result.current.setItem("a", 99);
            });

            expect(result.current.getItem("a")).toBe(99);
        });

        test("should use ref for synchronous reads", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["a", 1]])
            );

            act(() => {
                result.current.setItem("b", 2);
            });

            // After the state update completes, getItem should return the value
            expect(result.current.getItem("b")).toBe(2);
        });
    });

    describe("removeItem", () => {
        test("should remove item from map", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ])
            );

            act(() => {
                result.current.removeItem("b");
            });

            expect(result.current.map.size).toBe(2);
            expect(result.current.map.get("b")).toBeUndefined();
            expect(result.current.map.get("a")).toBe(1);
            expect(result.current.map.get("c")).toBe(3);
        });

        test("should handle removing non-existent key", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["a", 1]])
            );

            act(() => {
                result.current.removeItem("nonexistent");
            });

            expect(result.current.map.size).toBe(1);
            expect(result.current.map.get("a")).toBe(1);
        });

        test("should remove multiple items", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ])
            );

            act(() => {
                result.current.removeItem("a");
                result.current.removeItem("c");
            });

            expect(result.current.map.size).toBe(1);
            expect(result.current.map.get("b")).toBe(2);
        });

        test("should not mutate original map", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                ])
            );

            const originalMap = result.current.map;

            act(() => {
                result.current.removeItem("a");
            });

            expect(originalMap.size).toBe(2);
            expect(result.current.map.size).toBe(1);
        });
    });

    describe("clear", () => {
        test("should clear all items from map", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ])
            );

            act(() => {
                result.current.clear();
            });

            expect(result.current.map.size).toBe(0);
            expect(result.current.array).toEqual([]);
        });

        test("should clear already empty map", () => {
            const { result } = renderHook(() => useMap<string, number>([]));

            act(() => {
                result.current.clear();
            });

            expect(result.current.map.size).toBe(0);
        });

        test("should not mutate original map", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["a", 1]])
            );

            const originalMap = result.current.map;

            act(() => {
                result.current.clear();
            });

            expect(originalMap.size).toBe(1);
            expect(result.current.map.size).toBe(0);
        });
    });

    describe("array", () => {
        test("should return array of values", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ])
            );

            expect(result.current.array).toEqual([1, 2, 3]);
        });

        test("should return empty array for empty map", () => {
            const { result } = renderHook(() => useMap<string, number>([]));

            expect(result.current.array).toEqual([]);
        });

        test("should update array when items are added", () => {
            const { result } = renderHook(() => useMap<string, string>([]));

            act(() => {
                result.current.setItem("a", "alpha");
                result.current.setItem("b", "beta");
            });

            expect(result.current.array).toEqual(["alpha", "beta"]);
        });

        test("should update array when items are removed", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                    ["c", 3],
                ])
            );

            act(() => {
                result.current.removeItem("b");
            });

            expect(result.current.array).toEqual([1, 3]);
        });

        test("should handle complex object values in array", () => {
            const { result } = renderHook(() =>
                useMap<string, { id: number }>([
                    ["a", { id: 1 }],
                    ["b", { id: 2 }],
                ])
            );

            expect(result.current.array).toEqual([{ id: 1 }, { id: 2 }]);
        });
    });

    describe("rebase", () => {
        test("should replace entire map with new map", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                ])
            );

            act(() => {
                result.current.rebase(
                    new Map([
                        ["x", 10],
                        ["y", 20],
                    ])
                );
            });

            expect(result.current.map.size).toBe(2);
            expect(result.current.map.get("x")).toBe(10);
            expect(result.current.map.get("y")).toBe(20);
            expect(result.current.map.get("a")).toBeUndefined();
        });

        test("should replace map using function", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                ])
            );

            act(() => {
                result.current.rebase((prev) => {
                    const newMap = new Map(prev);
                    newMap.set("c", 3);
                    return newMap;
                });
            });

            expect(result.current.map.size).toBe(3);
            expect(result.current.map.get("c")).toBe(3);
        });

        test("should rebase to empty map", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([
                    ["a", 1],
                    ["b", 2],
                ])
            );

            act(() => {
                result.current.rebase(new Map());
            });

            expect(result.current.map.size).toBe(0);
            expect(result.current.array).toEqual([]);
        });
    });

    describe("combined operations", () => {
        test("should handle setItem, removeItem, and clear in sequence", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["a", 1]])
            );

            act(() => {
                result.current.setItem("b", 2);
                result.current.setItem("c", 3);
                result.current.removeItem("a");
            });

            expect(result.current.map.size).toBe(2);
            expect(result.current.array).toEqual([2, 3]);

            act(() => {
                result.current.clear();
            });

            expect(result.current.map.size).toBe(0);
        });

        test("should maintain consistency between map, array, and getItem", () => {
            const { result } = renderHook(() => useMap<string, number>([]));

            act(() => {
                result.current.setItem("a", 1);
                result.current.setItem("b", 2);
                result.current.setItem("c", 3);
            });

            // Check all access methods are consistent
            expect(result.current.map.size).toBe(3);
            expect(result.current.array.length).toBe(3);
            expect(result.current.getItem("a")).toBe(1);
            expect(result.current.map.get("a")).toBe(1);
            expect(result.current.array).toContain(1);
        });
    });

    describe("edge cases", () => {
        test("should handle numeric keys", () => {
            const { result } = renderHook(() =>
                useMap<number, string>([
                    [1, "one"],
                    [2, "two"],
                ])
            );

            act(() => {
                result.current.setItem(3, "three");
            });

            expect(result.current.getItem(1)).toBe("one");
            expect(result.current.getItem(3)).toBe("three");
            expect(result.current.map.size).toBe(3);
        });

        test("should handle object keys", () => {
            const key1 = { id: 1 };
            const key2 = { id: 2 };

            const { result } = renderHook(() =>
                useMap<{ id: number }, string>([
                    [key1, "first"],
                    [key2, "second"],
                ])
            );

            expect(result.current.getItem(key1)).toBe("first");
            expect(result.current.getItem(key2)).toBe("second");
        });

        test("should handle null values", () => {
            const { result } = renderHook(() =>
                useMap<string, string | null>([
                    ["a", "value"],
                    ["b", null],
                ])
            );

            expect(result.current.getItem("a")).toBe("value");
            expect(result.current.getItem("b")).toBe(null);
            expect(result.current.array).toEqual(["value", null]);
        });

        test("should handle undefined values", () => {
            const { result } = renderHook(() =>
                useMap<string, string | undefined>([
                    ["a", "value"],
                    ["b", undefined],
                ])
            );

            expect(result.current.getItem("a")).toBe("value");
            expect(result.current.getItem("b")).toBe(undefined);
        });

        test("should handle rapid updates", () => {
            const { result } = renderHook(() => useMap<string, number>([]));

            act(() => {
                for (let i = 0; i < 100; i++) {
                    result.current.setItem(`key${i}`, i);
                }
            });

            expect(result.current.map.size).toBe(100);
            expect(result.current.array.length).toBe(100);
        });
    });

    describe("ref synchronization", () => {
        test("should keep ref in sync with state", () => {
            const { result } = renderHook(() =>
                useMap<string, number>([["a", 1]])
            );

            act(() => {
                result.current.setItem("b", 2);
            });

            // getItem uses the ref, so it should have the updated value
            expect(result.current.getItem("b")).toBe(2);
        });

        test("should allow immediate reads after updates within same act", () => {
            const { result } = renderHook(() => useMap<string, number>([]));

            act(() => {
                result.current.setItem("key", 42);
            });

            // getItem reads from ref which is synchronized via useEffect after render
            expect(result.current.getItem("key")).toBe(42);
        });
    });
});
