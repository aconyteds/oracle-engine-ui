// Regex to capture "Type:ID" format.
// Allows for "Location", "NPC", "Plot" etc.
// The ID is a 24-character hex string for MongoDB ObjectIDs.
export const ASSET_LINK_REGEX = /^([a-zA-Z]+):([a-f\d]{24})$/;
