import { faHistory, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CampaignAssetVersionFragment } from "@graphql";
import React from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { formatRelativeTime } from "../../utils";
import { HoldConfirmButton } from "../Common";

export interface VersionHistoryDropdownProps {
    versions: CampaignAssetVersionFragment[];
    onRevert: (versionId: string) => Promise<void>;
    disabled?: boolean;
    isReverting?: boolean;
}

export const VersionHistoryDropdown: React.FC<VersionHistoryDropdownProps> = ({
    versions,
    onRevert,
    disabled = false,
    isReverting = false,
}) => {
    if (versions.length === 0) {
        return null;
    }

    return (
        <Dropdown drop="up" autoClose="outside">
            <Dropdown.Toggle
                variant="secondary"
                disabled={disabled || isReverting}
                title="Version history"
            >
                <FontAwesomeIcon icon={faHistory} className="me-1" />
                History
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ minWidth: "280px" }}>
                <Dropdown.Header>Version History</Dropdown.Header>
                {versions.map((version) => (
                    <div
                        key={version.id}
                        className="dropdown-item d-flex justify-content-between align-items-center gap-2"
                    >
                        <div className="flex-grow-1">
                            <div className="fw-medium text-truncate">
                                {version.name}
                            </div>
                            <small className="text-muted">
                                {formatRelativeTime(version.createdAt)} ago
                            </small>
                        </div>
                        <HoldConfirmButton
                            variant="outline-warning"
                            size="sm"
                            holdDuration={1000}
                            onConfirm={() => onRevert(version.id)}
                            disabled={isReverting || disabled}
                        >
                            {isReverting ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <FontAwesomeIcon icon={faUndo} />
                            )}
                        </HoldConfirmButton>
                    </div>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};
