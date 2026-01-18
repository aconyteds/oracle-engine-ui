import {
    type CurrentUserQuery,
    useCurrentUserQuery,
    useGetUsageLimitsLazyQuery,
} from "@graphql";
import { usageManager } from "@signals";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { restartWsClient, setAuthToken } from "../apolloClient";
import { auth } from "../components/firebase";
import { Loader } from "../components/Loader";
import {
    cleanupTokenRefresh,
    initializeTokenRefresh,
    setOnTokenRefresh,
} from "../services/tokenRefresh";
import { useToaster } from "./Toaster.context";

const showDebug = import.meta.env.VITE_ENV === "development";

type UserContextPayload = {
    isLoggedIn: boolean;
    setIsLoggedIn: () => void;
    handleLogin: () => void;
    currentUser: CurrentUserQuery["currentUser"] | null;
    isActive: boolean;
    loading: boolean;
    showDebug: boolean;
    refreshUsage: () => void;
};

const UserContext = createContext<UserContextPayload | undefined>(undefined);

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
}

export const UserProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [user, checkingUser] = useAuthState(auth);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { toast } = useToaster();
    // TODO:: Handle the login properly
    const { loading, error, data } = useCurrentUserQuery({
        skip: !isLoggedIn,
    });

    const [getUsageLimits] = useGetUsageLimitsLazyQuery({
        fetchPolicy: "network-only",
        onCompleted: (usageData) => {
            const dailyUsage = usageData?.currentUser?.usageLimits?.dailyUsage;
            if (dailyUsage && dailyUsage.limit) {
                usageManager.updateUsage({
                    limit: dailyUsage.limit,
                    current: dailyUsage.current,
                    percentUsed: dailyUsage.percentUsed,
                });
            }
        },
    });

    const checkUser = useCallback(async () => {
        if (!user) return;
        const token = await user.getIdToken();
        setAuthToken(token);
        setIsLoggedIn(true);
    }, [user]);

    useEffect(() => {
        if (checkingUser) return;
        checkUser();
    }, [checkingUser, checkUser]);

    // Initialize token refresh service when user is logged in
    useEffect(() => {
        if (!isLoggedIn) return;

        // Set up callback to restart WebSocket when token refreshes
        setOnTokenRefresh(() => {
            restartWsClient();
        });

        // Initialize the token refresh service
        initializeTokenRefresh();

        // Cleanup on unmount
        return () => {
            cleanupTokenRefresh();
        };
    }, [isLoggedIn]);

    // Fetch usage limits after current user data is loaded (confirms auth is working)
    useEffect(() => {
        if (!data?.currentUser) return;
        getUsageLimits();
    }, [data?.currentUser, getUsageLimits]);

    useEffect(() => {
        if (loading || !error) return;
        toast.danger({
            title: "Error fetching user data",
            message: error.message,
            duration: 5000,
        });
    }, [loading, error, toast.danger]);

    const handleLogin = useCallback(() => {
        setIsLoggedIn(true);
    }, []);

    const refreshUsage = useCallback(() => {
        getUsageLimits();
    }, [getUsageLimits]);

    const userContextPayload = useMemo<UserContextPayload>(
        () => ({
            isLoggedIn,
            handleLogin,
            setIsLoggedIn: handleLogin,
            currentUser: data?.currentUser || null,
            isActive: data?.currentUser?.isActive || false,
            loading,
            showDebug,
            refreshUsage,
        }),
        [isLoggedIn, handleLogin, data?.currentUser, loading, refreshUsage]
    );

    return (
        <UserContext.Provider value={userContextPayload}>
            {loading || checkingUser ? <Loader /> : children}
        </UserContext.Provider>
    );
};
