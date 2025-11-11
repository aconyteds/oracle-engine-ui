import {
    faMapPin,
    faPerson,
    faScroll,
    type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { RecordType } from "@graphql";

export const ASSET_TYPE_ICONS: Record<RecordType, IconDefinition> = {
    Plot: faScroll,
    NPC: faPerson,
    Location: faMapPin,
};
