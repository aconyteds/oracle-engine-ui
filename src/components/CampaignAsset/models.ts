import {
    faMapPin,
    faPerson,
    faScroll,
    type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { RecordType } from "@graphql";

export const ASSET_TYPE_ICONS: Record<RecordType, IconDefinition> = {
    [RecordType.Plot]: faScroll,
    [RecordType.Npc]: faPerson,
    [RecordType.Location]: faMapPin,
};
