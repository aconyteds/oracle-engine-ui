import { useCallback, useState } from "react";

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                setStoredValue((prev) => {
                    const valueToStore =
                        value instanceof Function ? value(prev) : value;
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem(
                            key,
                            JSON.stringify(valueToStore)
                        );
                    }
                    return valueToStore;
                });
            } catch (error) {
                console.error(error);
            }
        },
        [key]
    );

    return [storedValue, setValue];
}

export function useSessionStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                setStoredValue((prev) => {
                    const valueToStore =
                        value instanceof Function ? value(prev) : value;
                    if (typeof window !== "undefined") {
                        window.sessionStorage.setItem(
                            key,
                            JSON.stringify(valueToStore)
                        );
                    }
                    return valueToStore;
                });
            } catch (error) {
                console.error(error);
            }
        },
        [key]
    );

    return [storedValue, setValue];
}
