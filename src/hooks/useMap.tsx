import React, { useState } from "react";

export interface IUseMap<K, V> {
    map: Map<K, V>;
    array: V[];
    rebase: React.Dispatch<React.SetStateAction<Map<K, V>>>;
    getItem: (key: K) => V | undefined;
    setItem: (key: K, value: V) => void;
    removeItem: (key: K) => void;
    clear: () => void;
}

export function useMap<K, V>(defaultValue: [K, V][]): IUseMap<K, V> {
    const [map, setMap] = useState<Map<K, V>>(new Map(defaultValue));

    function setItem(key: K, value: V) {
        setMap((m) => new Map(m).set(key, value));
    }

    function removeItem(key: K) {
        setMap((m) => {
            const newMap = new Map(m);
            newMap.delete(key);
            return newMap;
        });
    }

    function getItem(key: K) {
        return map.get(key);
    }

    function clear() {
        setMap(new Map());
    }

    return {
        map,
        rebase: setMap,
        setItem,
        removeItem,
        clear,
        getItem,
        array: Array.from(map.values()),
    };
}
