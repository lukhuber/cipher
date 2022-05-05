import { calcEuclideanDistance } from '.././algorithms/euclideanDistance';
import {
	updateBunkerRCL2,
	updateBunkerRCL3,
	updateBunkerRCL4,
	updateBunkerRCL5,
	updateBunkerRCL6,
	updateBunkerRCL7,
	updateBunkerRCL8
} from './bunkerLayout';

export class Architect {
	static init(room: Room): void {
		room.memory.euclideanDistance = calcEuclideanDistance(room);

		Architect.placeBunkerAnchor(room);
		Architect.placeMiningSiteAnchors(room);
		Architect.placeUpgradeSiteAnchor(room);

		room.memory.isInitialized = true;
	}

	static run(room: Room): void {
		Architect.updateBunker(room);
	}

	private static placeBunkerAnchor(room: Room): void {
		const euclideanDistance: number[][] = room.memory.euclideanDistance;

		let maxVal: number = 0;
		let indexX: number = 0;
		let indexY: number = 0;

		// Find the biggest number in the 2D array... ------------------------------------------------------------------
		for (let x = 0; x < 50; x++) {
			const max: number = Math.max(...euclideanDistance[x]);

			if (max > maxVal) {
				indexX = x;
				indexY = euclideanDistance[x].indexOf(max);
				maxVal = max;
			}
		}

		// ... and place the bunker anchor (flag) there ----------------------------------------------------------------
		const flagPos: RoomPosition = new RoomPosition(indexX, indexY, room.name);
		flagPos.createFlag(room.name);
	}

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

	private static placeUpgradeSiteAnchor(room: Room): void {
		const controller: StructureController | undefined = room.controller;

		if (controller) {
			// @ts-ignore: Object is possibly 'null'.
			const spawn: StructureSpawn = controller.pos.findClosestByPath(FIND_MY_SPAWNS);
			const path: PathStep[] = controller.pos.findPathTo(spawn);
			const flagPos: RoomPosition = new RoomPosition(path[1].x, path[1].y, room.name);

			flagPos.createFlag(room.name + ' upgrade site');
		}
	}

	private static updateBunker(room: Room): void {
		// @ts-ignore: Object is possibly 'null'.
		const roomLevel: number | undefined = room.controller.level;
		const anchorPos: RoomPosition = Game.flags[room.name].pos;

		if (roomLevel >= 2) {
			updateBunkerRCL2(room, anchorPos);
		} else if (roomLevel >= 3) {
			updateBunkerRCL3(room, anchorPos);
		} else if (roomLevel >= 4) {
			updateBunkerRCL4(room, anchorPos);
		} else if (roomLevel >= 5) {
			updateBunkerRCL5(room, anchorPos);
		} else if (roomLevel >= 6) {
			updateBunkerRCL6(room, anchorPos);
		} else if (roomLevel >= 7) {
			updateBunkerRCL7(room, anchorPos);
		} else if (roomLevel >= 8) {
			updateBunkerRCL8(room, anchorPos);
		}
	}
}
