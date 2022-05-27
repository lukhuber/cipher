import { SpawnRequest, TransportRequest } from '.././request/Request';

export class Manager {
	static init(room: Room): void {
		Manager.monitorMiningSites(room); // Creates spawn requests for harvesters. One for each source
		Manager.monitorUpgradeSite(room); // Creates spawn requests for upgraders. Always just one
		Manager.manageWorkerCount(room); // Creates spawn requests for workers, depending on available energy
		Manager.createTransportRequests(room); // Creates transport requests to fill energy sinks/storages
	}

	private static monitorMiningSites(room: Room): void {
		const flags: Flag[] = _.filter(Game.flags, (f) =>
			f.name.includes(room.name + ' mining site')
		);

		// Cycle through all flags. Check if assigned harvester is still alive. Else create request. -----------------------
		for (const f of flags) {
			// Check if assigned harvester is dead or never existed (new room) -----------------------------------------------
			// @ts-ignore: Object is possibly 'null'.
			if (
				f.memory.assignedHarvester === undefined ||
				!Game.creeps[f.memory.assignedHarvester.name]
			) {
				Game.flags[f.name].memory.assignedHarvester = undefined;

				// Get spawn requests for harvesters. We don't want to create another one --------------------------------------
				const harvesterRequests: number = room
					.getSpawnRequests()
					.filter((r) => r.role === 'harvester').length;

				// Get spawns spawning harvesters. We don't want to create a request, if a harvester is spawning ---------------
				const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
				let harvesterSpawning: number = 0;
				for (const s of spawns) {
					const spawn: StructureSpawn = Game.spawns[s.name];
					if (spawn.spawning && spawn.spawning.name.includes('harvester')) {
						harvesterSpawning += 1;
					}
				}

				// Create request, if no harvester is spawning and no request is pending ---------------------------------------
				if (harvesterRequests === 0 && harvesterSpawning === 0) {
					const r: SpawnRequest = new SpawnRequest(10, 'harvester');
					room.memory.Requests.push(r);
				}
			}
		}

		// Check if all harvesters are assigned to mining sites ------------------------------------------------------------
		const harvesters: Creep[] = room.getCreepsByRole('harvester');

		for (const h of harvesters) {
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
		const f: Flag = _.filter(Game.flags, (f) =>
			f.name.includes(room.name + ' upgrade site')
		)[0];

		// Check if assigned harvester is dead or never existed (new room) -------------------------------------------------
		// @ts-ignore: Object is possibly 'null'.
		if (
			f.memory.assignedUpgrader === undefined ||
			!Game.creeps[f.memory.assignedUpgrader.name]
		) {
			Game.flags[f.name].memory.assignedUpgrader = undefined;

			// Get spawn requests for upgraders. We don't want to create another one ----------------------------------------
			const upgraderRequests: number = room
				.getSpawnRequests()
				.filter((r) => r.role === 'upgrader').length;

			// Get spawns spawning upgraders. We don't want to create a request, if a harvester is spawning -----------------
			const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
			let upgraderSpawning: number = 0;
			for (const s of spawns) {
				const spawn: StructureSpawn = Game.spawns[s.name];
				if (spawn.spawning && spawn.spawning.name.includes('upgrader')) {
					upgraderSpawning += 1;
				}
			}

			// Create request, if no upgrader is spawning and no request is pending -----------------------------------------
			if (upgraderRequests === 0 && upgraderSpawning === 0) {
				const spawnRequest: SpawnRequest = new SpawnRequest(6, 'upgrader');
				console.log('creating spawn');
				room.memory.Requests.push(spawnRequest);
			}
		}

		// Check if an upgrader is assigned to upgrade sites ---------------------------------------------------------------
		const upgraders: Creep[] = room.getCreepsByRole('upgrader');

		for (const upgrader of upgraders) {
			const creep: Creep = Game.creeps[upgrader.name];

			if (!creep.memory.assignedUpgradeSite) {
				const flagFreeUpgradeSite = room.find(FIND_FLAGS, {
					filter: (flag) => {
						return (
							!flag.memory.assignedUpgrader && flag.name.includes('upgrade')
						);
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
			// Get spawn requests for workers. We don't want to create another one ----------------------------------------
			const workerRequests: number = room
				.getSpawnRequests()
				.filter((r) => r.role === 'worker').length;

			// Get spawns spawning workers. We don't want to create a request, if a workers is spawning -----------------
			const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
			let workerSpawning: number = 0;
			for (const s of spawns) {
				const spawn: StructureSpawn = Game.spawns[s.name];
				if (spawn.spawning && spawn.spawning.name.includes('worker')) {
					workerSpawning += 1;
				}
			}

			// Create request, if no workers is spawning and no request is pending -----------------------------------------
			if (workerRequests === 0 && workerSpawning === 0) {
				const spawnRequest: SpawnRequest = new SpawnRequest(8, 'worker');
				room.memory.Requests.push(spawnRequest);
			}
		}
	}

	private static createTransportRequests(room: Room): void {
		const energyOnGround: Resource<ResourceConstant>[] = room.find(
			FIND_DROPPED_RESOURCES,
			{ filter: (r) => r.resourceType === RESOURCE_ENERGY }
		);

		const spawns: StructureSpawn[] = room.find(FIND_MY_STRUCTURES, {
			filter: (s) => s.structureType === STRUCTURE_SPAWN,
		});

		// Check if spawns need to be filled -------------------------------------------------------------------------------
		for (const s of spawns) {
			const spawnIsFull: boolean =
				s.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

			if (!spawnIsFull) {
				const transportRequest: TransportRequest = new TransportRequest(
					10,
					s,
					RESOURCE_ENERGY
				);

				const requests = room.getTransportRequests();

				if (!requests.some((r) => r.target.id === transportRequest.target.id)) {
					room.memory.Requests.push(transportRequest);
				}

				// TODO: Letzter Implementation von mir war: Transportrequests für Spawns werden korrekt erstellt. Jetzt
				// müssen sie noch abgearbeitet werden. Also beim Supervisor den Request in einen Task umwandeln und
				// einem Creep zuweisen.
			}
		}
	}
}
