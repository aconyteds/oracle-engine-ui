import { useUserContext } from "@context";
import React, { ReactNode } from "react";
import { Loader } from "../Loader";
import { MarketingScreen } from "../Marketing";

type ActiveUserRequirementProps = {
    children: ReactNode;
};

export const ActiveUserRequirement: React.FC<ActiveUserRequirementProps> = ({
    children,
}) => {
    const { isActive, loading } = useUserContext();

    // Show loading state while fetching user data
    if (loading) {
        return <Loader />;
    }

    // Show marketing screen if user is not active
    if (!isActive) {
        return <MarketingScreen />;
    }

    // User is active, render children
    return <>{children}</>;
};
