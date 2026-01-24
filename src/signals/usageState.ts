import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

export interface DailyUsage {
    percentUsed: number;
}

export interface UsageState {
    dailyUsage: DailyUsage | null;
    isLimitExceeded: boolean;
    lastUpdated: Date | null;
}

const initialUsageState: UsageState = {
    dailyUsage: null,
    isLimitExceeded: false,
    lastUpdated: null,
};

export const usageStateSignal = signal<UsageState>(initialUsageState);

export const usageManager = {
    updateUsage: (dailyUsage: DailyUsage) => {
        // percentUsed comes as decimal (1.0 = 100%), so compare against 1
        usageStateSignal.value = {
            dailyUsage,
            isLimitExceeded: dailyUsage.percentUsed >= 1,
            lastUpdated: new Date(),
        };
    },

    setLimitExceeded: (exceeded: boolean) => {
        usageStateSignal.value = {
            ...usageStateSignal.value,
            isLimitExceeded: exceeded,
        };
    },

    reset: () => {
        usageStateSignal.value = initialUsageState;
    },
};

export const useUsageState = () => {
    useSignals();
    return usageStateSignal.value;
};
