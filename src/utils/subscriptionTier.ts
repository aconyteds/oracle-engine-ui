type TierConfig = {
    variant: string;
    color: string;
};

const TIER_CONFIG: Record<string, TierConfig> = {
    Free: { variant: "secondary", color: "#6c757d" },
    "Game Master": { variant: "info", color: "#0dcaf0" },
    "World Builder": { variant: "warning", color: "#ffc107" },
    "Professional GM": { variant: "danger", color: "#dc3545" },
    Admin: { variant: "dark", color: "#212529" },
};

const FREE_TIER = "Free";

const DEFAULT_CONFIG: TierConfig = TIER_CONFIG[FREE_TIER];

export function getTierConfig(tier: string | null | undefined): TierConfig {
    return TIER_CONFIG[tier ?? FREE_TIER] ?? DEFAULT_CONFIG;
}

export function isFreeTier(tier: string | null | undefined): boolean {
    return !tier || tier === FREE_TIER;
}

export function formatPrice(priceInCents: number): string {
    return `$${(priceInCents / 100).toFixed(2)}`;
}

type ProductForSorting = { name: string; priceInCents: number };

export function sortProductsByPrice<T extends ProductForSorting>(
    products: readonly T[]
): T[] {
    return [...products].sort((a, b) => a.priceInCents - b.priceInCents);
}

export function getTierIndex(
    tierName: string,
    sortedProducts: readonly ProductForSorting[]
): number {
    return sortedProducts.findIndex((p) => p.name === tierName);
}

export type CardActionType = "upgrade" | "manage" | "none";

export function getCardActionType(
    productIndex: number,
    currentTierIndex: number
): CardActionType {
    if (productIndex > currentTierIndex) return "upgrade";
    if (currentTierIndex === 0) return "none";
    return "manage";
}
