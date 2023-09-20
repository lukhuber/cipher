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

// Priorities with which build requests get orderes within themselves
export enum BUILD_PRIORITIES {
    STRUCTURE_EXTENSION = 10,
    STRUCTURE_TOWER     = 9,
    STRUCTURE_STORAGE   = 8,
    STRUCTURE_CONTAINER = 1,
}

// Threshold after which more workers will be spawned
export const ENERGY_ON_GROUND_THRESHOLD: number = 1000