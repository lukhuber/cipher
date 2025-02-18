import { SpawnRequest } from '.././request/Request';

export class Pioneer {
    static init(room: Room): void {
		}

    static run(room: Room): void {
        // Save the exits of the room in memory for later use
        if (!room.memory.exits || Object.keys(room.memory.exits).length === 0) {
            room.memory.exits = Game.map.describeExits(room.name);
        }

        if (room.getCreepsByRole('scout').length === 0) {
            room.memory.isScoutNeeded = true;
        } else {
            room.memory.isScoutNeeded = false;
        }

        if (room.memory.isScoutNeeded) {
            room.createSpawnRequest('scout');
        } 
    }
}
