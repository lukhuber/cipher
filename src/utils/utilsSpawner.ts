function getHarvesterParts(room: Room): BodyPartConstant[] {
	const workerIsAvailable: boolean = room.getCreepsByRole('worker').length > 0

	// When no worker is in the room, the harvester must haul energy to spawn -----------------------------------------
	if(!workerIsAvailable) {
		return [WORK, CARRY, MOVE, MOVE]
	}

	// Else cram up to 5 WORK (priority!) and up to 5 MOVE into the harvester -----------------------------------------
	let energyAvailable: number = room.energyAvailable

	let workPossible: number = Math.floor(energyAvailable / 100) 			// This much WORK are possible
	const energyIsRemaining: boolean = energyAvailable % 100 >= 50			// Check if there is still energy for MOVE
	workPossible = energyIsRemaining ? workPossible : workPossible - 	1	// Adjust number of WORK, depending on eIR
	workPossible = workPossible > 5 ? 5 : workPossible						// We only want max. 5 WORK

	energyAvailable -= workPossible * 100									// Adjust energyAvailable

	let movePossible: number = Math.floor(energyAvailable / 100)			// This much MOVE are possible
	movePossible = movePossible > 5 ? 5 : movePossible						// We only want max. 5 MOVE

	// Prepare array to return ----------------------------------------------------------------------------------------
	const parts: BodyPartConstant[] = []

	for (let i = 0; i < workPossible; i++) {								// Add WORK to parts array
		parts.push(WORK)
	}

	for (let i = 0; i < movePossible; i++) {								// Add MOVE to parts array
		parts.push(MOVE)
	}

	return parts
}

function getUpgraderParts(room: Room): BodyPartConstant[] {
	let energyAvailable: number = room.energyAvailable
	const partsCosts: number = 250											// Represents cost of WORK, CARRY, MOVE, MOVE
	const parts: BodyPartConstant[] = []

	for (; energyAvailable > partsCosts; energyAvailable =- partsCosts) {
		parts.push(WORK)
		parts.push(CARRY)
		parts.push(MOVE)
		parts.push(MOVE)
	}

	return parts
}

function getWorkerParts(room: Room): BodyPartConstant[] {
	let energyAvailable: number = room.energyAvailable
	const partsCosts: number = 250											// Represents cost of WORK, CARRY, MOVE, MOVE
	const parts: BodyPartConstant[] = []

	for (; energyAvailable > partsCosts; energyAvailable =- partsCosts) {
		parts.push(WORK)
		parts.push(CARRY)
		parts.push(MOVE)
		parts.push(MOVE)
	}

	return parts
}

export function getBodyParts(role: string | undefined, room: Room): BodyPartConstant[] {
	switch (role) {
		case 'harvester':
			return getHarvesterParts(room);
		case 'upgrader':
			return getUpgraderParts(room);
		case 'worker':
			return getWorkerParts(room);
		default:
			return [WORK, CARRY, MOVE, MOVE];
	}
}

export function getNewCreepName (role: string | undefined) {
  return role + Game.time.toString()
}
