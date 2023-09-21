import { SpawnRequest, TransportRequest, UpgradeRequest, BuildRequest } from '.././request/Request';
import { ENERGY_ON_GROUND_THRESHOLD, BUILD_PRIORITIES } from '.././settings';

// The Manager is responsible for creating all requests, which the Supervisor will then assign to creeps ##############
export class Manager {
	static init(room: Room): void {
		Manager.assessRoomState(room);				// Sets flags in room memory according to room status
		Manager.assignContainerRole(room);			// Establishes difference between mining site containers and others
	}

	// This function combines all other functions assessing the current state of the room and creating requests =======
	static run(room: Room): void {
		Manager.createPermanentRequests(room);		// Adds permanent Requests (i.e. UpgradeController)
		Manager.monitorMiningSites(room);			// Makes sure, that each source has a Harvester
		Manager.monitorUpgradeSite(room);			// Makes sure, that one Upgrader is always available

		Manager.manageWorkerCount(room);			// Creates spawn requests for workers, depending on available energy
		Manager.manageTransporterCount(room);		// Creates spawn requests for transporter. Always 2
		Manager.manageJanitorCount(room);			// Creates spawn requests for janitor. Always 1

		Manager.createTransportRequests(room);		// Creates transport requests to fill energy sinks/storages
		Manager.updateTransportRequests(room);		// Checks and adjusts existing transport requests
		Manager.createBuildRequests(room);			// Creates building requets for each construction site
		Manager.updateBuildRequests(room);			// Delete finished constructions from the requestlist
	}

	// There are several flags in room memory, which indicate room status. This function sets them ====================
	private static assessRoomState(room: Room): void {
		// Check if all containers in this room are built -------------------------------------------------------------
		const containerCount: number = room.find(FIND_STRUCTURES, {
			filter: { structureType: STRUCTURE_CONTAINER },}).length;
		const containerConstructionCount: number = room.find(FIND_MY_CONSTRUCTION_SITES, { 
			filter: { structureType: STRUCTURE_CONTAINER },}).length;

		room.memory.containersBuilt = containerCount > 0 && containerConstructionCount === 0 ? true : false;

		// Check if janitor is present --------------------------------------------------------------------------------
		const janitorPresent: boolean = room.getCreepsByRole('janitor').length > 0 ? true : false;

		room.memory.janitorPresent = janitorPresent ? true : false
	}

	// We need the information which container is which, since we want to transport from mining site to somewhere else
	// This should maybe be moved to Memory.ts
	private static assignContainerRole(room: Room): void {
		const miningSites: Flag[] = _.filter(Game.flags, (f) => f.name.includes(room.name + ' mining site'));
		const upgradeSite: Flag = _.filter(Game.flags, (f) => f.name.includes(room.name + ' upgrade site'))[0];
		const bunkerAnchor: Flag = Game.flags[room.name];

		// Stores the ID of the upgrade container in the rooms memory -------------------------------------------------
		if (!room.memory.upgradeContainer) {
			const upgradeContainer: Structure[] = upgradeSite.pos.lookFor(LOOK_STRUCTURES);
			
			if (upgradeContainer.length) {
				room.memory.upgradeContainer = upgradeContainer[0].id;
			}
		}

		// Stores the ID of the mining containers in the rooms memory -------------------------------------------------
		if (room.memory.miningContainers.length != miningSites.length) {
			for (const flag of miningSites) {
				const miningContainer: Structure[] = flag.pos.lookFor(LOOK_STRUCTURES);

				if (miningContainer.length && !room.memory.miningContainers.includes(miningContainer[0].id)) {
					room.memory.miningContainers.push(miningContainer[0].id)
				}
			}
		}

		// Stores the ID of the bunker container (later the storage) in the rooms memory ------------------------------
		if (!room.memory.storage) {
			let storagePos: RoomPosition = new RoomPosition(bunkerAnchor.pos.x + 1, bunkerAnchor.pos.y, room.name) // Hardcoded, I know -.-
			
			// if there is actually a real storage (not just the temporary container) we want to save that in memory
			const actualStorage = room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_STORAGE },});
			if (actualStorage.length > 0) {
				storagePos = actualStorage[0].pos;
			}

			const storage: Structure[] = storagePos.lookFor(LOOK_STRUCTURES);

			if (storage.length) {
				room.memory.storage = storage[0].id;
			}
		}
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

	// Makes sure to always have at least 2 workers. More workers will be spawed, if energy permits it ================
	private static manageWorkerCount(room: Room): void {
		const workerCount: number = room.getCreepsByRole('worker').length;
		const energyOnGround: number = _.sum(_.map(room.find(FIND_DROPPED_RESOURCES), (energy) => energy.amount));

		const containers: StructureContainer[] = room.find(FIND_STRUCTURES, {
			filter: { structureType: STRUCTURE_CONTAINER },
		}) as unknown as StructureContainer[];
		let containerCapacity: number = 0;
		let energyInContainers: number = 0;

		if (containers.length != 0) {
			for (const container of containers) {
				containerCapacity += container.store.getCapacity();
				energyInContainers += container.store[RESOURCE_ENERGY];
			}
		}

		let upgradeContainerLevel: number = 0;
		let storageLevel: number = 0;

		if (room.memory.containersBuilt) {
			upgradeContainerLevel = Game.getObjectById(room.memory.upgradeContainer).store.getUsedCapacity(RESOURCE_ENERGY);
			storageLevel = Game.getObjectById(room.memory.storage).store.getUsedCapacity(RESOURCE_ENERGY);
		}

		// Create spawn request if certain requirements are met -------------------------------------------------------
		if (workerCount < 2 ||	// Always keep worker count at 2
			(!room.memory.containersBuilt && energyInContainers > containerCapacity / 1.5) ||
			(!room.memory.containersBuilt && energyOnGround >= ENERGY_ON_GROUND_THRESHOLD) ||
			(storageLevel >= 1500 && upgradeContainerLevel === 2000)) {
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

	// Make sure to always have 1 tranporters =========================================================================
	private static manageTransporterCount(room: Room): void {
		const controller: StructureController | undefined = room.controller;

		if (room.controller == undefined || room.controller.level < 2) { 	// We don't need transporters prior level 2
			return
		}

		const transporterCount: number = room.getCreepsByRole('transporter').length;

		let energyInMiningContainers: number = 0;

		if (room.memory.miningContainers) {
			for (const c of room.memory.miningContainers) {
				energyInMiningContainers += Game.getObjectById(c).store.getUsedCapacity(RESOURCE_ENERGY);
			}
		}

		// We make also sure, that all containers are finished building -----------------------------------------------
		if (room.memory.containersBuilt && transporterCount < 2 || energyInMiningContainers > 3000) {
			// Get spawn requests for transporters. We don't want to create another one -------------------------------
			const transporterRequests: number = room.getSpawnRequests().filter((r) => r.role === 'transporter').length;

			// Get spawns spawning transporters. We don't want to create a request, if a transporter is spawning ------
			const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
			let transporterSpawning: number = 0;
			for (const s of spawns) {
				const spawn: StructureSpawn = Game.spawns[s.name];
				if (spawn.spawning && spawn.spawning.name.includes('transporter')) {
					transporterSpawning += 1;
				}
			}

			const workerCount: number = room.getCreepsByRole('worker').length;

			// This makes sure, that at least one worker and one transporter are spawned, instead of only workers -----
			const priority: number = workerCount < 2 ? 2 : 5;

			// Create request, if no transporter is spawning and no request is pending --------------------------------
			if (transporterRequests === 0 && transporterSpawning === 0) {
				const spawnRequest: SpawnRequest = new SpawnRequest(priority, 'transporter');
				room.memory.Requests.push(spawnRequest);
			}
		}
	}

	// Makes sure, that 1 janitor is always present. Will spawn 1 janitor 100 ticks before the other is dead ==========
	private static manageJanitorCount(room: Room): void {
		const janitor: Creep[] = room.getCreepsByRole('janitor');

		if (janitor.length <= 1 && room.memory.containersBuilt) {
			// If the janitor has more than 100 ticks to live, skip spawn request creation ----------------------------
			// @ts-ignore: Object is possibly 'null'.
			if (janitor.length > 0 && janitor[0].ticksToLive > 100) {
				return;
			}

			// Get spawn requests for janitors. We don't want to create another one -----------------------------------
			const janitorRequests: number = room.getSpawnRequests().filter((r) => r.role === 'janitor').length;

			// Get spawns spawning transporters. We don't want to create a request, if a janitor is spawning ----------
			const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
			let janitorSpawning: number = 0;
			for (const s of spawns) {
				const spawn: StructureSpawn = Game.spawns[s.name];
				if (spawn.spawning && spawn.spawning.name.includes('janitor')) {
					janitorSpawning += 1;
				}
			}

			// Create request, if no transporter is spawning and no request is pending --------------------------------
			if (janitorRequests === 0 && janitorSpawning === 0) {
				const spawnRequest: SpawnRequest = new SpawnRequest(4, 'janitor');
				room.memory.Requests.push(spawnRequest);
			}
		}
	}

	// If a energy sink/storage has no request yet, but needs energy, this function will create a TransportRequest ====
	private static createTransportRequests(room: Room): void {
		const existingRequests: Request[] = room.getTransportRequests();

		// Check if spawns need to be filled --------------------------------------------------------------------------
		const spawns: StructureSpawn[] = room.find(FIND_MY_STRUCTURES, {
			filter: (s) => s.structureType === STRUCTURE_SPAWN,
		});

		for (const s of spawns) {
			const spawnIsFull: boolean = s.store.getFreeCapacity(RESOURCE_ENERGY) === 0;

			if (!spawnIsFull) {
				const transportRequest: TransportRequest = new TransportRequest(s.id, 9, RESOURCE_ENERGY);
				if (!existingRequests.some((r) => r.targetId === transportRequest.targetId)) {
					room.memory.Requests.push(transportRequest);
					// room.setFullCreepsToIdle(); // Full creeps travelling elsewhere should fill instead
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
				const transportRequest: TransportRequest = new TransportRequest(e.id, 10, RESOURCE_ENERGY);

				if (!existingRequests.some((r) => r.targetId === transportRequest.targetId)) {
					room.memory.Requests.push(transportRequest);
				}
			}
		}

		// Check if towers need to be filled --------------------------------------------------------------------------
		const towers: StructureTower[] = room.find(FIND_MY_STRUCTURES, {
			filter: (t) => t.structureType === STRUCTURE_TOWER,
		});

		for (const t of towers) {
			// Towers don't need to be filled all the way. Only fill if there is enough space for 400 energy
			const towerNeedsEnergy: boolean = t.store.getFreeCapacity(RESOURCE_ENERGY) >= 400;
			if (towerNeedsEnergy && Game.time % 10 === 0) {
				const transportRequest: TransportRequest = new TransportRequest(t.id, 0, RESOURCE_ENERGY);

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

			// Check if target is full and delete Request -------------------------------------------------------------
			const target = Game.getObjectById(r.targetId) as SinkUnit;
			if(target === null) {
				throw new Error ('Target of TransportRequest does not exist (anymore)');
			}
			if(target) {
				const targetIsFull: boolean = target.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
				if (targetIsFull || 
					// We need to check towers seperately, since they can expend energy at the same tick they got filled
					// @ts-ignore: Object is possibly 'null'.
					(target.structureType === STRUCTURE_TOWER && target.store.getFreeCapacity() === 10)) {
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

	// If a construction site has no request yet, this function will create a BuildRequest ============================
	private static createBuildRequests(room: Room): void {
		const constructionSites: ConstructionSite[] = room.find(FIND_MY_CONSTRUCTION_SITES);
		const existingRequests: Request[] = room.getRequestsByType('build');

		for (const conSite of constructionSites) {
			let buildPriority: number = 0;

			switch(conSite.structureType) { 
			   case STRUCTURE_EXTENSION: { 
			      buildPriority = BUILD_PRIORITIES.STRUCTURE_EXTENSION
			      break; 
			   } 
			   case STRUCTURE_TOWER: { 
			      buildPriority = BUILD_PRIORITIES.STRUCTURE_TOWER
			      break; 
			   }
			   case STRUCTURE_STORAGE: { 
			      buildPriority = BUILD_PRIORITIES.STRUCTURE_STORAGE
			      break; 
			   }
			   case STRUCTURE_CONTAINER: { 
			      buildPriority = BUILD_PRIORITIES.STRUCTURE_CONTAINER
			      break; 
			   } 
			   default: { 
			      buildPriority = 0
			      break; 
			   } 
			}

			const buildRequest: BuildRequest = new BuildRequest(conSite.id, buildPriority);

			if (!existingRequests.some((r) => r.targetId === buildRequest.targetId)) {
				room.memory.Requests.push(buildRequest);
			}
		}
	}

	// After constructions are finished, they need to be removed from the BuildRequests ===============================
	private static updateBuildRequests(room: Room): void {
		const existingRequests: Request[] = room.getRequestsByType('build');

		for (const request of existingRequests) {
			if (Game.getObjectById(request.targetId) === null) {
				// Set assigned Creeps to idle
				for (const creepPair of request.assignedCreeps) {
					const creep: Creep = Game.creeps[creepPair[0]];
					creep.memory.isIdle = true;
				}
				// Delete the Request
				const index = room.memory.Requests.indexOf(request, 0);
				room.memory.Requests.splice(index, 1)
			}
		}


	}
}
