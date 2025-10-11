import React, { useCallback, useState } from "react";

export interface IUseArray<T> {
    array: T[];
    set: React.Dispatch<React.SetStateAction<T[]>>;
    push: (element: T) => void;
    filter: (callback: () => boolean) => void;
    update: (index: number, newElement: T) => void;
    remove: (index: number) => void;
    clear: () => void;
}

export function useArray<T>(defaultValue: T[]): IUseArray<T> {
    const [array, setArray] = useState<T[]>(defaultValue);

    const push = useCallback((element: T) => {
        setArray((a) => [...a, element]);
    }, []);

    const filter = useCallback((callback: () => boolean) => {
        setArray((a) => a.filter(callback));
    }, []);

    const update = useCallback((index: number, newElement: T) => {
        setArray((a) => {
            const newArray = [...a];
            newArray[index] = newElement;
            return newArray;
        });
    }, []);

    const remove = useCallback((index: number) => {
        setArray((a) => {
            const newArray = [...a];
            newArray.splice(index, 1);
            return newArray;
        });
    }, []);

    const clear = useCallback(() => {
        setArray([]);
    }, []);

    return { array, set: setArray, push, filter, update, remove, clear };
}
