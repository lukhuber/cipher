//
// _________________________________
//
//           _     _
//       ___|_|___| |_ ___ ___
//      |  _| | . |   | -_|  _|
//      |___|_|  _|_|_|___|_|
//            |_|
//
// _________________ lukhuber ______
//
//
// cipher repository: github.com/lukhuber/cipher
//

'use strict';

// Import all needed files =============================================================================================
import './prototypes/RoomVisual';
import { ErrorMapper } from 'utils/ErrorMapper';
import { ROOM_STATISTICS, ROOM_EUCLID_DIST } from './settings';
import { Architect } from './architect/Architect';
import { Visuals } from './visuals/Visuals';
// =====================================================================================================================

// Main loop
export const loop = ErrorMapper.wrapLoop(() => {
	// Cycle through each room and run each component --------------------------------------------------------------------
	for (const i in Game.rooms) {
		const room: Room = Game.rooms[i];

    // Calculate euclidean distance and place flags for room -----------------------------------------------------------
		if (!room.memory.isInitialized) {
			Architect.init(room);
		}

    // Place constructions sites in room (Should maybe only be all every 100 ticks) ------------------------------------
    Architect.run(room)

		// Show room statistics --------------------------------------------------------------------------------------------
		if (ROOM_STATISTICS && Game.cpu.bucket > 9000) {
			Visuals.displayStatistics(room);
		}

		if (ROOM_EUCLID_DIST) {
			Visuals.displayEuclidDist(room);
		}
	}
});
