import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T) => void] {
    const storageLocation = useRef<Storage>();
    useEffect(() => {
        storageLocation.current = window.localStorage;
        const item: unknown = storageLocation.current?.getItem(key);
        if (!item) return;
        setValue(item as T);
    }, []);

    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = storageLocation.current?.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });
    const setValue = (value: T): void => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            storageLocation.current?.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

export function useSessionStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T) => void] {
    const storageLocation = useRef<Storage>(sessionStorage);
    useEffect(() => {
        storageLocation.current = sessionStorage;
    }, []);
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = storageLocation.current.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value: T): void => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            storageLocation.current.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}
