import { RecordType } from "@graphql";
import React from "react";
import { ASSET_LINK_REGEX } from "@/constants";
import { assetModalManager } from "../../signals/campaignAssetModals";

interface AssetLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href?: string;
    children?: React.ReactNode;
}

export const AssetLink: React.FC<AssetLinkProps> = ({
    href,
    children,
    ...props
}) => {
    if (href) {
        try {
            // Decode URI component to handle encoded colons (e.g., Location%3A...)
            const decodedHref = decodeURIComponent(href).trim();
            const match = decodedHref.match(ASSET_LINK_REGEX);

            if (match) {
                const [, typeString, id] = match;

                // Helper to resolve the correct RecordType enum value
                // This handles case differences if any (e.g. "Npc" vs "NPC")
                let assetType: RecordType | undefined;

                // Check against RecordType values
                const typeName = typeString;
                if (
                    Object.values(RecordType).includes(typeName as RecordType)
                ) {
                    assetType = typeName as RecordType;
                } else {
                    // Fallback: try to match case-insensitively against values
                    const matchingValue = Object.values(RecordType).find(
                        (val) => val.toLowerCase() === typeString.toLowerCase()
                    );
                    if (matchingValue) {
                        assetType = matchingValue;
                    }
                }

                if (assetType) {
                    return (
                        <span
                            className="text-primary text-decoration-underline"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                assetModalManager.openModal(
                                    assetType!,
                                    id,
                                    children?.toString() || ""
                                );
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Open asset details for ${children?.toString() || "asset"}`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    assetModalManager.openModal(
                                        assetType!,
                                        id,
                                        children?.toString() || ""
                                    );
                                }
                            }}
                        >
                            {children}
                        </span>
                    );
                }
            }
        } catch (e) {
            console.error("Error parsing markdown link:", e);
        }
    }

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
        </a>
    );
};
