import React, { useState } from "react";

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

    function push(element: T) {
        setArray((a) => [...a, element]);
    }

    function filter(callback: () => boolean) {
        setArray((a) => a.filter(callback));
    }

    function update(index: number, newElement: T) {
        setArray((a) => {
            const newArray = [...a];
            newArray[index] = newElement;
            return newArray;
        });
    }

    function remove(index: number) {
        setArray((a) => {
            const newArray = [...a];
            newArray.splice(index, 1);
            return newArray;
        });
    }

    function clear() {
        setArray([]);
    }

    return { array, set: setArray, push, filter, update, remove, clear };
}
