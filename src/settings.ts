// Toggle visuals showing room statistics in top left corner of every room
export const ROOM_STATISTICS: boolean = true;

// Toggle visuals showing euclidean distance of room
export const ROOM_EUCLID_DIST: boolean = false;

// Priorities with which Requests get ordered
export enum REQUEST_PRIORITIES {
    REFUEL_REQUEST = -1,
    UPGRADE_REQUEST = 0,
    BUILD_REQUEST = 1,
    TRANSPORT_REQUEST = 2,
}
