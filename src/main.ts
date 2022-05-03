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
import { ROOM_STATISTICS } from './settings';
import { RoomStatistics } from './visuals/RoomStatistics';
// =====================================================================================================================

// Main loop
export const loop = ErrorMapper.wrapLoop(() => {
	// Cycle through each room and run each component --------------------------------------------------------------------
	for (const i in Game.rooms) {
		const room: Room = Game.rooms[i];

		// Show room statistics --------------------------------------------------------------------------------------------
		if (ROOM_STATISTICS) {
			RoomStatistics.display(room);
		}
	}
});
