import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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
    const mapRef = useRef<Map<K, V>>(map);

    // Keep ref in sync with state
    useEffect(() => {
        mapRef.current = map;
    }, [map]);

    const setItem = useCallback((key: K, value: V) => {
        setMap((m) => new Map(m).set(key, value));
    }, []);

    const removeItem = useCallback((key: K) => {
        setMap((m) => {
            const newMap = new Map(m);
            newMap.delete(key);
            return newMap;
        });
    }, []);

    const getItem = useCallback((key: K) => {
        return mapRef.current.get(key);
    }, []);

    const clear = useCallback(() => {
        setMap(new Map());
    }, []);

    const array = useMemo(() => Array.from(map.values()), [map]);

    return {
        map,
        rebase: setMap,
        setItem,
        removeItem,
        clear,
        getItem,
        array,
    };
}
