import { calcEuclideanDistance } from '.././algorithms/euclideanDistance';

export class Architect {
	static init(room: Room): void {
		room.memory.euclideanDistance = calcEuclideanDistance(room);

		Architect.placeBunkerAnchor(room);
		Architect.initializeMiningSites(room);
		Architect.initializeUpgradeSite(room);
		room.memory.isInitialized = true;
	}

	private static placeBunkerAnchor(room: Room): void {
		const euclideanDistance: number[][] = room.memory.euclideanDistance;

		let maxVal: number = 0;
		let indexX: number = 0;
		let indexY: number = 0;

		for (let x = 0; x < 50; x++) {
			const max: number = Math.max(...euclideanDistance[x]);

			if (max > maxVal) {
				indexX = x;
				indexY = euclideanDistance[x].indexOf(max);
				maxVal = max;
			}
		}

		const flagPos = new RoomPosition(indexX, indexY, room.name);
		flagPos.createFlag(room.name);
	}

	private static initializeMiningSites(room: Room): void {}

	private static initializeUpgradeSite(room: Room): void {}
}
