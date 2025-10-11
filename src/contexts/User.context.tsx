import { useCurrentUserQuery } from "@graphql";
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
import { setAuthToken } from "../apolloClient";
import { auth } from "../components/firebase";
import { Loader } from "../components/Loader";
import { useToaster } from "./Toaster.context";

type UserContextPayload = {
    isLoggedIn: boolean;
    setIsLoggedIn: () => void;
    handleLogin: () => void;
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
    const { loading, error } = useCurrentUserQuery({
        skip: !isLoggedIn,
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

    const userContextPayload = useMemo<UserContextPayload>(
        () => ({
            isLoggedIn,
            handleLogin,
            setIsLoggedIn: handleLogin,
        }),
        [isLoggedIn, handleLogin]
    );

    return (
        <UserContext.Provider value={userContextPayload}>
            {loading || checkingUser ? <Loader /> : children}
        </UserContext.Provider>
    );
};
