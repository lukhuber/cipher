import { Request } from '.././request/Request';

export class Manager {
	static init(room: Room): void {

		Manager.monitorMiningSites(room);
		Manager.monitorUpgradeSite(room);
		Manager.manageWorkerCount(room);
	}

	private static monitorMiningSites(room: Room): void {
		const flags: Flag[] = _.filter(Game.flags, (f) => f.name.includes(room.name + ' mining site'));

		// Cycle through all flags. Check if assigned harvester is still alive. Else create request. -----------------------
		for (let f of flags) {
			// Check if assigned harvester is dead or never existed (new room) -----------------------------------------------
			// @ts-ignore: Object is possibly 'null'.
			if (f.memory.assignedHarvester === undefined || !Game.creeps[f.memory.assignedHarvester.name]) {
				Game.flags[f.name].memory.assignedHarvester = undefined;
				const requestQueue: Request[] = room.memory.Requests;

				// Get spawn requests for harvesters. We don't want to create another one --------------------------------------
				let harvesterRequests: number = requestQueue.filter((r) => r.type === 'spawn' && r.role === 'harvester').length;

				// Get spawns spawning harvesters. We don't want to create a request, if a harvester is spawning ---------------
				const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
				let harvesterSpawning: number = 0;
				for (let s of spawns) {
					const spawn: StructureSpawn = Game.spawns[s.name];
					if (spawn.spawning && spawn.spawning.name.includes('harvester')) {
						harvesterSpawning += 1;
					}
				}

				// Create request, if no harvester is spawning and no request is pending ---------------------------------------
				if (harvesterRequests === 0 && harvesterSpawning === 0) {
					console.log("Still trying to spawn harvesters")
					const r: Request = new Request('spawn', 10, 'harvester');
					room.memory.Requests.push(r);
				}
			}
		}

		// Check if all harvesters are assigned to mining sites ------------------------------------------------------------
		const harvesters: Creep[] = room.getCreepsByRole('harvester');

		for (let h of harvesters) {
			const creep = Game.creeps[h.name];

			if (!creep.memory.assignedMiningSite) {
				const freeMiningSite: Flag = room.find(FIND_FLAGS, {
					filter: (f) => {
						return !f.memory.assignedHarvester && f.name.includes('mining');
					},
				})[0];

				creep.memory.assignedMiningSite = freeMiningSite.name;
				freeMiningSite.memory.assignedHarvester = creep;
			}
		}
	}

	private static monitorUpgradeSite(room: Room): void {
		const f: Flag = _.filter(Game.flags, (f) => f.name.includes(room.name + ' upgrade site'))[0];

		// Check if assigned harvester is dead or never existed (new room) -------------------------------------------------
		// @ts-ignore: Object is possibly 'null'.
		if (f.memory.assignedUpgrader === undefined || !Game.creeps[f.memory.assignedUpgrader.name]) {
			Game.flags[f.name].memory.assignedUpgrader = undefined;
			const requestQueue: Request[] = room.memory.Requests;

			// Get spawn requests for harvesters. We don't want to create another one ----------------------------------------
			const upgraderRequests: number = requestQueue.filter((r) => r.type === 'spawn' && r.role === 'upgrader').length;

			// Get spawns spawning harvesters. We don't want to create a request, if a harvester is spawning -----------------
			const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
			let upgraderSpawning: number = 0;
			for (let s of spawns) {
				const spawn: StructureSpawn = Game.spawns[s.name];
				if (spawn.spawning && spawn.spawning.name.includes('upgrader')) {
					upgraderSpawning += 1;
				}
			}

			// Create request, if no harvester is spawning and no request is pending -----------------------------------------
			if (upgraderRequests === 0 && upgraderSpawning === 0) {
				const spawnRequest: Request = new Request('spawn', 6, 'upgrader');
				room.memory.Requests.push(spawnRequest);
			}
		}

		// Check if an upgrader is assigned to upgrade sites ---------------------------------------------------------------
		const upgraders: Creep[] = room.getCreepsByRole('upgrader');

		for (let upgrader of upgraders) {
			const creep: Creep = Game.creeps[upgrader.name];

			if (!creep.memory.assignedUpgradeSite) {
				const flagFreeUpgradeSite = room.find(FIND_FLAGS, {
					filter: (flag) => {
						return !flag.memory.assignedUpgrader && flag.name.includes('upgrade');
					},
				})[0];

				creep.memory.assignedUpgradeSite = flagFreeUpgradeSite.name;
				flagFreeUpgradeSite.memory.assignedUpgrader = creep;
			}
		}
	}

	private static manageWorkerCount(room: Room): void {
		const workerCount: number = room.getCreepsByRole('worker').length;

		if (workerCount < 2) {
			const requestQueue: Request[] = room.memory.Requests;

			// Get spawn requests for harvesters. We don't want to create another one ----------------------------------------
			const upgraderRequests: number = requestQueue.filter((r) => r.type === 'spawn' && r.role === 'worker').length;

			// Get spawns spawning harvesters. We don't want to create a request, if a harvester is spawning -----------------
			const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
			let upgraderSpawning: number = 0;
			for (let s of spawns) {
				const spawn: StructureSpawn = Game.spawns[s.name];
				if (spawn.spawning && spawn.spawning.name.includes('worker')) {
					upgraderSpawning += 1;
				}
			}

			// Create request, if no harvester is spawning and no request is pending -----------------------------------------
			if (upgraderRequests === 0 && upgraderSpawning === 0) {
				const spawnRequest: Request = new Request('spawn', 8, 'worker');
				room.memory.Requests.push(spawnRequest);
			}
		} 
	}
}
