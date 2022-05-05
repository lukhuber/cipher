import { calcEuclideanDistance } from '.././algorithms/euclideanDistance';

export class Architect {
	static init(room: Room): void {
		room.memory.euclideanDistance = calcEuclideanDistance(room);

		Architect.placeBunkerAnchor(room);
		Architect.placeMiningSiteAnchors(room);
		Architect.placeUpgradeSiteAnchor(room);
		
		room.memory.isInitialized = true;
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
			const index = sources.indexOf(s);

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
}
