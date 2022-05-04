function create2DArray(width: number, height: number, content?: number): number[][] {
	const arr: number[][] = new Array(height)
		.fill(content ? content : 0)
		.map(() => new Array(width).fill(content ? content : 0));

	return arr;
}

export function calcEuclideanDistance(room: Room): number[][] {
	// Prepare variables for algorithm -----------------------------------------------------------------------------------
	const terrain: RoomTerrain = new Room.Terrain(room.name);
	const euclideanDistance: number[][] = create2DArray(50, 50, 0);

	// First iteration through room, from top left to lower right --------------------------------------------------------
	for (let x = 1; x < 49; x++) {
		for (let y = 1; y < 49; y++) {
			if (terrain.get(x, y) === 0) {
				const upperVal: number = euclideanDistance[x][y - 1];
				const leftVal: number = euclideanDistance[x - 1][y];
				const upperLeftVal: number = euclideanDistance[x - 1][y - 1];

				euclideanDistance[x][y] = Math.min(upperVal, leftVal, upperLeftVal) + 1;
			} else {
				euclideanDistance[x][y] = 0;
			}
		}
	}

	// Second iteration through room, from lower right to top left -------------------------------------------------------
	for (let x = 48; x > 0; x--) {
		for (let y = 48; y > 0; y--) {
			if (terrain.get(x, y) === 0) {
				const lowerVal: number = euclideanDistance[x][y + 1];
				const rightVal: number = euclideanDistance[x + 1][y];
				const upperVal: number = euclideanDistance[x][y - 1];
				const leftVal: number = euclideanDistance[x - 1][y];

				const upperLeftVal: number = euclideanDistance[x - 1][y - 1];
				const upperRightVal: number = euclideanDistance[x + 1][y - 1];
				const lowerLeftVal: number = euclideanDistance[x - 1][y + 1];
				const lowerRightVal: number = euclideanDistance[x + 1][y + 1];

				euclideanDistance[x][y] =
					Math.min(upperVal, leftVal, lowerVal, rightVal, upperLeftVal, lowerLeftVal, upperRightVal, lowerRightVal) + 1;
			} else {
				euclideanDistance[x][y] = 0;
			}
		}
	}

	// Third iteration through room, from top left to lower right -------------------------------------------------------
	for (let y = 1; y > 49; y++) {
		for (let x = 1; x > 49; x++) {
			if (terrain.get(x, y) === 0) {
				const lowerVal: number = euclideanDistance[x][y + 1];
				const rightVal: number = euclideanDistance[x + 1][y];
				const upperVal: number = euclideanDistance[x][y - 1];
				const leftVal: number = euclideanDistance[x - 1][y];

				const upperLeftVal: number = euclideanDistance[x - 1][y - 1];
				const upperRightVal: number = euclideanDistance[x + 1][y - 1];
				const lowerLeftVal: number = euclideanDistance[x - 1][y + 1];
				const lowerRightVal: number = euclideanDistance[x + 1][y + 1];

				euclideanDistance[x][y] =
					Math.min(upperVal, leftVal, lowerVal, rightVal, upperLeftVal, lowerLeftVal, upperRightVal, lowerRightVal) + 1;
			} else {
				euclideanDistance[x][y] = 0;
			}
		}
	}

	// Fourth iteration through room, from lower right to top left -------------------------------------------------------
	for (let y = 48; y > 0; y--) {
		for (let x = 48; x > 0; x--) {
			if (terrain.get(x, y) === 0) {
				const lowerVal: number = euclideanDistance[x][y + 1];
				const rightVal: number = euclideanDistance[x + 1][y];
				const upperVal: number = euclideanDistance[x][y - 1];
				const leftVal: number = euclideanDistance[x - 1][y];

				const upperLeftVal: number = euclideanDistance[x - 1][y - 1];
				const upperRightVal: number = euclideanDistance[x + 1][y - 1];
				const lowerLeftVal: number = euclideanDistance[x - 1][y + 1];
				const lowerRightVal: number = euclideanDistance[x + 1][y + 1];

				euclideanDistance[x][y] =
					Math.min(upperVal, leftVal, lowerVal, rightVal, upperLeftVal, lowerLeftVal, upperRightVal, lowerRightVal) + 1;
			} else {
				euclideanDistance[x][y] = 0;
			}
		}
	}

	return euclideanDistance;
}
