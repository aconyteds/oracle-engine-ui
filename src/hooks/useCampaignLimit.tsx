import { useGetUsageLimitsQuery } from "@graphql";
import { useMemo } from "react";

export const useCampaignLimit = () => {
    const { data: usageData } = useGetUsageLimitsQuery({
        fetchPolicy: "network-only",
    });

    const { canCreate, campaignLimit } = useMemo(() => {
        if (!usageData || !usageData.currentUser?.usageLimits?.campaignUsage)
            return {
                canCreate: false,
                campaignLimit: 0,
            };
        const campaignUsage = usageData.currentUser.usageLimits.campaignUsage;
        return {
            canCreate: campaignUsage.canCreate ?? false,
            campaignLimit: campaignUsage.limit ?? 0,
        };
    }, [usageData]);

    const limitMessage = `You've reached your limit of ${campaignLimit} ${
        campaignLimit === 1 ? "campaign" : "campaigns"
    }. To create more, upgrade your subscription or delete an existing campaign.`;

    return {
        canCreate,
        campaignLimit,
        limitMessage,
    };
};
