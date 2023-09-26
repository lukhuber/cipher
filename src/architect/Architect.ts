import { calcEuclideanDistance } from '.././algorithms/euclideanDistance';
import {
	updateBunkerRCL2,
	updateBunkerRCL3,
	updateBunkerRCL4,
	updateBunkerRCL5,
	updateBunkerRCL6,
	updateBunkerRCL7,
	updateBunkerRCL8,
} from './bunkerLayout';

// The Architect prepares each room in terms of bunker placement, roads and other buildings ###########################
export class Architect {
	// This function is call for all uninitialized rooms ==============================================================
	static init(room: Room): void {
		room.memory.euclideanDistance = calcEuclideanDistance(room); // Save euclidDist for this room

		Architect.placeBunkerAnchor(room); // Places the bunker anchor at best pos
		Architect.placeMiningSiteAnchors(room); // Anchors for mining site containers
		Architect.placeUpgradeSiteAnchor(room); // Anchors for upgrade site container

		room.memory.isInitialized = true;
	}

	// This function is only call for initialized rooms ===============================================================
	static run(room: Room): void {
		Architect.updateBunker(room); // Checks controller level and updates bunker accordingly
	}

	// Places bunker anchor furthest away from walls. Bunker needs at least 7 blocks space in each direction ==========
	private static placeBunkerAnchor(room: Room): void {
		const euclideanDistance: number[][] = room.memory.euclideanDistance;

		let maxVal: number = 0;
		let indexX: number = 0;
		let indexY: number = 0;

		// Find the biggest number in the 2D array... -----------------------------------------------------------------
		for (let x = 0; x < 50; x++) {
			const max: number = Math.max(...euclideanDistance[x]);

			if (max > maxVal) {
				indexX = x;
				indexY = euclideanDistance[x].indexOf(max);
				maxVal = max;
			}
		}

		// ... and place the bunker anchor (flag) there ---------------------------------------------------------------
		const flagPos: RoomPosition = new RoomPosition(indexX, indexY, room.name);
		flagPos.createFlag(room.name);
	}

	// Places mining site anchor right beside each source =============================================================
	private static placeMiningSiteAnchors(room: Room): void {
		const sources: Source[] = room.find(FIND_SOURCES);

		for (let s of sources) {
			// @ts-ignore: Object is possibly 'null'.
			const spawn: StructureSpawn = s.pos.findClosestByPath(FIND_MY_SPAWNS);
			const path: PathStep[] = s.pos.findPathTo(spawn);
			const flagPos: RoomPosition = new RoomPosition(path[0].x, path[0].y, room.name);
			const index: number = sources.indexOf(s);

			flagPos.createFlag(room.name + ' mining site ' + index);
		}
	}

	// Places upgrade site anchor a bit away from controller for more space ===========================================
	private static placeUpgradeSiteAnchor(room: Room): void {
		const controller: StructureController | undefined = room.controller;

		if (controller) {
			// @ts-ignore: Object is possibly 'null'.
			const spawn: StructureSpawn = controller.pos.findClosestByPath(FIND_MY_SPAWNS);
			const path: PathStep[] = controller.pos.findPathTo(spawn);
			const flagPos: RoomPosition = new RoomPosition(path[2].x, path[2].y, room.name);

			flagPos.createFlag(room.name + ' upgrade site');
		}
	}

	// Compares current construction sites and buildings to blueprint and places new construction sites ===============
	private static updateBunker(room: Room): void {
		// @ts-ignore: Object is possibly 'null'.
		const roomLevel: number | undefined = room.controller.level;
		const anchorPos: RoomPosition = Game.flags[room.name].pos;

		if (roomLevel >= 2) {
			updateBunkerRCL2(room, anchorPos);
		}

		if (roomLevel >= 3) {
			updateBunkerRCL3(room, anchorPos);
		}

		if (roomLevel >= 4) {
			updateBunkerRCL4(room, anchorPos);
		}

		if (roomLevel >= 5) {
			updateBunkerRCL5(room, anchorPos);
		}

		if (roomLevel >= 6) {
			updateBunkerRCL6(room, anchorPos);
		}

		if (roomLevel >= 7) {
			updateBunkerRCL7(room, anchorPos);
		}

		if (roomLevel >= 8) {
			updateBunkerRCL8(room, anchorPos);
		}
	}
}
