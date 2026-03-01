import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

export interface DailyUsage {
    percentUsed: number;
}

export interface MonthlyUsage {
    percentUsed: number;
}

export interface UsageState {
    dailyUsage: DailyUsage | null;
    monthlyUsage: MonthlyUsage | null;
    isLimitExceeded: boolean;
    isMonthlyLimitExceeded: boolean;
    lastUpdated: Date | null;
}

const initialUsageState: UsageState = {
    dailyUsage: null,
    monthlyUsage: null,
    isLimitExceeded: false,
    isMonthlyLimitExceeded: false,
    lastUpdated: null,
};

export const usageStateSignal = signal<UsageState>(initialUsageState);

export const usageManager = {
    updateUsage: (
        dailyUsage: DailyUsage,
        monthlyUsage?: MonthlyUsage | null
    ) => {
        // percentUsed comes as decimal (1.0 = 100%), so compare against 1
        const isDailyExceeded = dailyUsage.percentUsed >= 1;
        const isMonthlyExceeded =
            monthlyUsage != null && monthlyUsage.percentUsed >= 1;
        usageStateSignal.value = {
            dailyUsage,
            monthlyUsage: monthlyUsage ?? null,
            isLimitExceeded: isDailyExceeded || isMonthlyExceeded,
            isMonthlyLimitExceeded: isMonthlyExceeded,
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
