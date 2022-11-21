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

// Import all needed files ============================================================================================
import './prototypes/RoomVisual';
import './prototypes/Room';
import './prototypes/Creep';
import { ErrorMapper } from 'utils/ErrorMapper';
import { ROOM_STATISTICS, ROOM_EUCLID_DIST } from './settings';
import { Console } from './console/Console'
import { Memory } from './memory/Memory';
import { Architect } from './architect/Architect';
import { Manager } from './manager/Manager';
import { Supervisor } from './supervisor/Supervisor';
import { Visuals } from './visuals/Visuals';
// ====================================================================================================================

// Main loop
export const loop = ErrorMapper.wrapLoop(() => {
	// Cycle through each room and run each component -----------------------------------------------------------------
	for (const i in Game.rooms) {
		const room: Room = Game.rooms[i];
		Console.init();											// Provides console commands

		// Prepare room for subsequent code ---------------------------------------------------------------------------
		if (!room.memory.isInitialized) {
			Architect.init(room);								// Calc euclidean distance and place flags
			Memory.init(room);									// Prepare memory for all entities in room
		}

		// Check for new work and create requests ---------------------------------------------------------------------
		if (room.memory.isInitialized) {
		  Architect.run(room);									// Place construction sites
		  Manager.init(room);									// Create request for undone work
		  Supervisor.init(room);								// Assign requests to creeps/spawns/towers/etc.
		  Supervisor.run(room);									// Do the assigned requests
		}

		// Show room statistics ---------------------------------------------------------------------------------------
		if (ROOM_STATISTICS && Game.cpu.bucket > 9000) {
			Visuals.displayStatistics(room);
		}

		if (ROOM_EUCLID_DIST) {
			Visuals.displayEuclidDist(room);
		}
	}
});
