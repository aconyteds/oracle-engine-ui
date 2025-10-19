import {
    RelevantCampaignDetailsFragment,
    useAllMyCampaignsQuery,
    useCurrentUserQuery,
} from "@graphql";
import { useLocalStorage } from "@hooks";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useToaster } from "./Toaster.context";

type CampaignContextPayload = {
    selectedCampaign: RelevantCampaignDetailsFragment | null;
    campaignList: RelevantCampaignDetailsFragment[];
    selectCampaign: (
        campaignId: string | null,
        campaignListOverride?: RelevantCampaignDetailsFragment[]
    ) => void;
    loading: boolean;
    openCampaignModal: (campaign?: RelevantCampaignDetailsFragment) => void;
    closeCampaignModal: () => void;
    modalCampaign: RelevantCampaignDetailsFragment | null;
    isModalOpen: boolean;
    refreshCampaigns: () => Promise<RelevantCampaignDetailsFragment[]>;
};

const CampaignContext = createContext<CampaignContextPayload | undefined>(
    undefined
);

type CampaignProviderProps = {
    children: ReactNode;
};

export function useCampaignContext() {
    const context = useContext(CampaignContext);
    if (!context) {
        throw new Error(
            "useCampaignContext must be used within a CampaignProvider"
        );
    }
    return context;
}

// Export a function to get the current campaign ID for Apollo Client
let currentCampaignId: string | null = null;
export const getCurrentCampaignId = () => currentCampaignId;

export const CampaignProvider: React.FC<CampaignProviderProps> = ({
    children,
}) => {
    const { toast } = useToaster();
    const [storedCampaignId, setStoredCampaignId] = useLocalStorage<
        string | null
    >("selectedCampaignId", null);

    const [selectedCampaign, setSelectedCampaign] =
        useState<RelevantCampaignDetailsFragment | null>(null);
    const [campaignList, setCampaignList] = useState<
        RelevantCampaignDetailsFragment[]
    >([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalCampaign, setModalCampaign] =
        useState<RelevantCampaignDetailsFragment | null>(null);

    // Fetch current user to get last selected campaign
    const { data: userData } = useCurrentUserQuery({
        fetchPolicy: "cache-first",
    });

    // Fetch all campaigns
    const {
        data: campaignsData,
        loading,
        refetch: refetchCampaigns,
    } = useAllMyCampaignsQuery({
        fetchPolicy: "network-only",
    });

    // Update campaign list when data changes
    useEffect(() => {
        if (!campaignsData?.campaigns) {
            setCampaignList([]);
            return;
        }
        setCampaignList(campaignsData.campaigns);
    }, [campaignsData]);

    // Initialize selected campaign on mount
    useEffect(() => {
        if (loading || campaignList.length === 0) return;

        // Priority: 1. Stored ID, 2. User's last selected, 3. First campaign
        let campaignToSelect: RelevantCampaignDetailsFragment | undefined;

        if (storedCampaignId) {
            campaignToSelect = campaignList.find(
                (c) => c.id === storedCampaignId
            );
        }

        if (!campaignToSelect && userData?.currentUser?.lastSelectedCampaign) {
            campaignToSelect = campaignList.find(
                (c) => c.id === userData.currentUser.lastSelectedCampaign?.id
            );
        }

        if (!campaignToSelect && campaignList.length > 0) {
            campaignToSelect = campaignList[0];
        }

        if (campaignToSelect) {
            setSelectedCampaign(campaignToSelect);
            setStoredCampaignId(campaignToSelect.id);
            currentCampaignId = campaignToSelect.id;
        }
    }, [
        loading,
        campaignList,
        storedCampaignId,
        userData,
        setStoredCampaignId,
    ]);

    const selectCampaign = useCallback(
        (
            campaignId: string | null,
            campaignListOverride?: RelevantCampaignDetailsFragment[]
        ) => {
            if (!campaignId) {
                setSelectedCampaign(null);
                setStoredCampaignId(null);
                currentCampaignId = null;
                return;
            }

            // Use override list if provided (for race condition fix), otherwise use state
            const listToSearch = campaignListOverride || campaignList;
            const campaign = listToSearch.find((c) => c.id === campaignId);
            if (!campaign) {
                toast.warning({
                    title: "Campaign Not Found",
                    message: "The selected campaign could not be found.",
                    duration: 3000,
                });
                return;
            }

            setSelectedCampaign(campaign);
            setStoredCampaignId(campaignId);
            currentCampaignId = campaignId;
        },
        [campaignList, setStoredCampaignId, toast]
    );

    const openCampaignModal = useCallback(
        (campaign?: RelevantCampaignDetailsFragment) => {
            setModalCampaign(campaign || null);
            setIsModalOpen(true);
        },
        []
    );

    const closeCampaignModal = useCallback(() => {
        setIsModalOpen(false);
        setModalCampaign(null);
    }, []);

    const refreshCampaigns = useCallback(async (): Promise<
        RelevantCampaignDetailsFragment[]
    > => {
        try {
            const { data } = await refetchCampaigns();
            if (data?.campaigns) {
                const campaigns =
                    data.campaigns as RelevantCampaignDetailsFragment[];
                setCampaignList(campaigns);
                // If current campaign was updated, refresh it
                if (selectedCampaign) {
                    const updated = campaigns.find(
                        (c) => c.id === selectedCampaign.id
                    );
                    if (updated) {
                        setSelectedCampaign(updated);
                    }
                }
                return campaigns;
            }
            return [];
        } catch (_error) {
            toast.danger({
                title: "Error Refreshing Campaigns",
                message: "Failed to refresh campaign list.",
                duration: 5000,
            });
            return [];
        }
    }, [refetchCampaigns, selectedCampaign, toast]);

    const campaignContextPayload = useMemo<CampaignContextPayload>(
        () => ({
            selectedCampaign,
            campaignList,
            selectCampaign,
            loading,
            openCampaignModal,
            closeCampaignModal,
            modalCampaign,
            isModalOpen,
            refreshCampaigns,
        }),
        [
            selectedCampaign,
            campaignList,
            selectCampaign,
            loading,
            openCampaignModal,
            closeCampaignModal,
            modalCampaign,
            isModalOpen,
            refreshCampaigns,
        ]
    );

    return (
        <CampaignContext.Provider value={campaignContextPayload}>
            {children}
        </CampaignContext.Provider>
    );
};
