import React, {
    useContext,
    useState,
    createContext,
    ReactNode,
    useMemo,
    useEffect,
    useCallback,
} from "react";
import { useCurrentUserQuery } from "@graphql";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../components/firebase";
import { setAuthToken } from "../apolloClient";
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

    const checkUser = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        setAuthToken(token);
        setIsLoggedIn(true);
    };

    useEffect(() => {
        if (checkingUser) return;
        checkUser();
    }, [checkingUser, user]);

    useEffect(() => {
        if (loading || !error) return;
        toast.danger({
            title: "Error fetching user data",
            message: error.message,
            duration: 5000,
        });
    }, [loading, error]);

    const handleLogin = useCallback(() => {
        setIsLoggedIn(true);
    }, [setIsLoggedIn]);

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
