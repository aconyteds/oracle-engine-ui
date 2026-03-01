import React from "react";
import { Link } from "react-router-dom";
import { useFeatures } from "../../hooks";

export type UpgradeLinkProps = {
    upgradeAvailable: boolean;
};

export const UpgradeLink: React.FC<UpgradeLinkProps> = ({
    upgradeAvailable,
}) => {
    const { monetizationEnabled } = useFeatures();

    if (!upgradeAvailable || !monetizationEnabled) {
        return null;
    }
    return (
        <span>
            {" "}
            Please consider{" "}
            <Link to="/subscription">upgrading your subscription</Link>.
        </span>
    );
};

export default UpgradeLink;
