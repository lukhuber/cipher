import { SpawnRequest, TransportRequest, UpgradeRequest } from '.././request/Request';

// The Manager is responsible for creating all requests, which the Supervisor will then assign to creeps ##############
export class Manager {
	static init(room: Room): void {

	}

	// This function combines all other functions assessing the current state of the room and creating requests =======
	static run(room: Room): void {
		Manager.createPermanentRequests(room);	// Adds permanent Requests (i.e. UpgradeController)
		Manager.monitorMiningSites(room);			// Makes sure, that each source has a Harvester
		Manager.monitorUpgradeSite(room);			// Makes sure, that one Upgrader is always available
		Manager.manageWorkerCount(room);			// Creates spawn requests for workers, depending on available energy
		Manager.createTransportRequests(room);		// Creates transport requests to fill energy sinks/storages
		Manager.updateTransportRequests(room);		// Checks and adjusts existing transport requests
	}

	private static createPermanentRequests(room: Room): void {
		// Check if upgradeRequest for this room is existing. Continue if not -----------------------------------------
		if (_.includes(_.map(room.memory.Requests, (r) => r.type), 'upgrade')) {
			return;
		}

		if (room.controller != undefined) {
			const newUpgradeRequest: UpgradeRequest = new UpgradeRequest(room.controller.id);
			room.memory.Requests.push(newUpgradeRequest);
		} else {
			console.log(room.name + "does not have a controller. \n" +
						"No permanent UpgradeRequest created for this room.");
		}
	}

	// Check if the assigned Harvester is (still) alive and creates a SpawnRequest if not =============================
	private static monitorMiningSites(room: Room): void {
		const flags: Flag[] = _.filter(Game.flags, (f) => f.name.includes(room.name + ' mining site'));

		// Cycle through all flags. Check if assigned harvester is still alive. Else create request. ------------------
		for (const f of flags) {
			// Check if assigned harvester is dead or never existed (new room) ----------------------------------------
			// @ts-ignore: Object is possibly 'null'.
			if (f.memory.assignedHarvester === undefined || !Game.creeps[f.memory.assignedHarvester.name]) {
				Game.flags[f.name].memory.assignedHarvester = undefined;

				// Get spawn requests for harvesters. We don't want to create another one -----------------------------
				const harvesterRequests: number = room.getSpawnRequests().filter((r) => r.role === 'harvester').length;

				// Get spawns spawning harvesters. We don't want to create a request, if a harvester is spawning ------
				const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
				let harvesterSpawning: number = 0;
				for (const s of spawns) {
					const spawn: StructureSpawn = Game.spawns[s.name];
					if (spawn.spawning && spawn.spawning.name.includes('harvester')) {
						harvesterSpawning += 1;
					}
				}

				// Create request, if no harvester is spawning and no request is pending ------------------------------
				if (harvesterRequests === 0 && harvesterSpawning === 0) {
					const r: SpawnRequest = new SpawnRequest(10, 'harvester');
					room.memory.Requests.push(r);
				}
			}
		}

		// Check if all harvesters are assigned to mining sites -------------------------------------------------------
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

	// Check if at least one Upgrader is (still) alive and creates a SpawnRequest if not ==============================
	private static monitorUpgradeSite(room: Room): void {
		const f: Flag = _.filter(Game.flags, (f) => f.name.includes(room.name + ' upgrade site'))[0];

		// Check if assigned harvester is dead or never existed (new room) --------------------------------------------
		// @ts-ignore: Object is possibly 'null'.
		if (f.memory.assignedUpgrader === undefined || !Game.creeps[f.memory.assignedUpgrader.name]) {
			Game.flags[f.name].memory.assignedUpgrader = undefined;

			// Get spawn requests for upgraders. We don't want to create another one ----------------------------------
			const upgraderRequests: number = room.getSpawnRequests().filter((r) => r.role === 'upgrader').length;

			// Get spawns spawning upgraders. We don't want to create a request, if a harvester is spawning -----------
			const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
			let upgraderSpawning: number = 0;
			for (const s of spawns) {
				const spawn: StructureSpawn = Game.spawns[s.name];
				if (spawn.spawning && spawn.spawning.name.includes('upgrader')) {
					upgraderSpawning += 1;
				}
			}

			// Create request, if no upgrader is spawning and no request is pending -----------------------------------
			if (upgraderRequests === 0 && upgraderSpawning === 0) {
				const spawnRequest: SpawnRequest = new SpawnRequest(6, 'upgrader');
				room.memory.Requests.push(spawnRequest);
			}
		}

		// Check if an upgrader is assigned to upgrade sites ----------------------------------------------------------
		const upgraders: Creep[] = room.getCreepsByRole('upgrader');

		for (const upgrader of upgraders) {
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

	// Very rudimentary system to always have two workers. Will be replaced with a much smarter solution :) ===========
	private static manageWorkerCount(room: Room): void {
		const workerCount: number = room.getCreepsByRole('worker').length;

		if (workerCount < 2) {
			// Get spawn requests for workers. We don't want to create another one ------------------------------------
			const workerRequests: number = room.getSpawnRequests().filter((r) => r.role === 'worker').length;

			// Get spawns spawning workers. We don't want to create a request, if a workers is spawning ---------------
			const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
			let workerSpawning: number = 0;
			for (const s of spawns) {
				const spawn: StructureSpawn = Game.spawns[s.name];
				if (spawn.spawning && spawn.spawning.name.includes('worker')) {
					workerSpawning += 1;
				}
			}

			// Create request, if no workers is spawning and no request is pending ------------------------------------
			if (workerRequests === 0 && workerSpawning === 0) {
				const spawnRequest: SpawnRequest = new SpawnRequest(4, 'worker');
				room.memory.Requests.push(spawnRequest);
			}
		}
	}

	// If a energy sink/storage has no request yet, but needs energy, this function will create a TransportRequest ====
	private static createTransportRequests(room: Room): void {
		const existingRequests = room.getTransportRequests();

		// Check if spawns need to be filled --------------------------------------------------------------------------
		const spawns: StructureSpawn[] = room.find(FIND_MY_STRUCTURES, {
			filter: (s) => s.structureType === STRUCTURE_SPAWN,
		});

		for (const s of spawns) {
			const spawnIsFull: boolean = s.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

			if (!spawnIsFull) {
				const transportRequest: TransportRequest = new TransportRequest(s.id, RESOURCE_ENERGY);
				if (!existingRequests.some((r) => r.targetId === transportRequest.targetId)) {
					room.memory.Requests.push(transportRequest);
				}
			}
		}

		// Check if extensions need to be filled ----------------------------------------------------------------------
		const extensions: StructureExtension[] = room.find(FIND_MY_STRUCTURES, {
			filter: (e) => e.structureType === STRUCTURE_EXTENSION,
		});

		for (const e of extensions) {
			const extensionIsFull: boolean = e.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

			if (!extensionIsFull) {
				const transportRequest: TransportRequest = new TransportRequest(e.id, RESOURCE_ENERGY);

				if (!existingRequests.some((r) => r.targetId === transportRequest.targetId)) {
					room.memory.Requests.push(transportRequest);
				}
			}
		}
	}

	// Updating existing TransportRequests. A creep could have died while hauling =====================================
	private static updateTransportRequests(room: Room): void {
		const existingTransportRequests = room.getRequestsByType('transport');

		for (const r of existingTransportRequests) {

			// Check if spawn filled itself (1 energy/s) and delete Request if it did ---------------------------------
			const target = Game.getObjectById(r.targetId) as SinkUnit;
			if(target === null) {
				throw new Error ('Target of TransportRequest does not exist (anymore)');
			}
			if(target instanceof StructureSpawn) {
				const targetIsFull: boolean = target.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

				if (targetIsFull) {
					// Set assigned Creeps to idle
					for (const creepPair of r.assignedCreeps) {
						const creep: Creep = Game.creeps[creepPair[0]];
						creep.memory.isIdle = true;
					}
					// Delete the Request
					const index = room.memory.Requests.indexOf(r, 0);
					room.memory.Requests.splice(index, 1)
				}
			}

			// Update 'neededEnergy' of all Requests ------------------------------------------------------------------
			r.neededEnergy = target.store.getFreeCapacity(RESOURCE_ENERGY);
		}


	}
}
