export type FeatureFlags = {
    registrationEnabled: boolean;
    monetizationEnabled: boolean;
};

export const useFeatures = (): FeatureFlags => {
    const registrationEnabled =
        import.meta.env.VITE_ALLOW_REGISTRATION === "true";
    const monetizationEnabled =
        import.meta.env.VITE_MONETIZATION_ENABLED === "true";

    return {
        registrationEnabled,
        monetizationEnabled,
    };
};
