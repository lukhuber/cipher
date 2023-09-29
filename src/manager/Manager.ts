import { SpawnRequest, TransportRequest, UpgradeRequest, BuildRequest } from '.././request/Request';
import { ENERGY_ON_GROUND_THRESHOLD, BUILD_PRIORITIES } from '.././settings';

// The Manager is responsible for creating all requests, which the Supervisor will then assign to creeps ##############
export class Manager {
	static init(room: Room): void {
		Manager.assessRoomState(room); // Sets flags in room memory according to room status
		Manager.assignContainerRole(room); // Establishes difference between mining site containers and others
		Manager.createPermanentRequests(room); // Adds permanent Requests (i.e. UpgradeController)
	}

	// This function combines all other functions assessing the current state of the room and creating requests =======
	static run(room: Room): void {
		Manager.monitorMiningSites(room); // Makes sure, that each source has a Harvester
		Manager.monitorUpgradeSite(room); // Makes sure, that Upgrade is assigned to controller
		Manager.createSpawnRequests(room); // Manages the creep count of each role
		Manager.createTransportRequests(room); // Creates transport requests to fill energy sinks/storages
		Manager.updateTransportRequests(room); // Checks and adjusts existing transport requests
		Manager.createBuildRequests(room); // Creates building requets for each construction site
		Manager.updateBuildRequests(room); // Delete finished constructions from the requestlist
	}

	// There are several flags in room memory, which indicate room status. This function sets them ====================
	private static assessRoomState(room: Room): void {
		// Check if all containers in this room are built -------------------------------------------------------------
		const containerCount: number = room.find(FIND_STRUCTURES, {
			filter: { structureType: STRUCTURE_CONTAINER },
		}).length;
		const containerConstructionCount: number = room.find(FIND_MY_CONSTRUCTION_SITES, {
			filter: { structureType: STRUCTURE_CONTAINER },
		}).length;

		room.memory.containersBuilt = containerCount > 0 && containerConstructionCount === 0 ? true : false;

		// Check if janitor is present --------------------------------------------------------------------------------
		room.memory.janitorPresent = room.getCreepsByRole('janitor').length > 0 ? true : false;

		// Check if transporter is present ----------------------------------------------------------------------------
		room.memory.transporterPresent = room.getCreepsByRole('transporter').length > 0 ? true : false;
	}

	// We need the information which container is which, since we want to transport from mining site to somewhere else=
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
					room.memory.miningContainers.push(miningContainer[0].id);
				}
			}
		}

		// Stores the ID of the bunker container (later the storage) in the rooms memory ------------------------------
		if (!room.memory.storage || Game.time % 1000 === 0) {
			let storagePos: RoomPosition = new RoomPosition(bunkerAnchor.pos.x + 1, bunkerAnchor.pos.y, room.name); // Hardcoded, I know -.-

			// If there is actually a real storage (not just the temporary container) we want to save that in memory
			const actualStorage = room.find(FIND_MY_STRUCTURES, {
				filter: { structureType: STRUCTURE_STORAGE },
			});
			if (actualStorage.length > 0) {
				storagePos = actualStorage[0].pos;
			}

			const storage: Structure[] = storagePos.lookFor(LOOK_STRUCTURES);

			if (storage.length) {
				room.memory.storage = storage[0].id;
			}
		}
	}

	// Currently only creates the permanent upgrade request in each room ==============================================
	private static createPermanentRequests(room: Room): void {
		// Check if upgradeRequest for this room is existing. Continue if not -----------------------------------------
		if (
			_.includes(
				_.map(room.memory.Requests, (r) => r.type),
				'upgrade'
			)
		) {
			return;
		}

		if (room.controller != undefined) {
			const newUpgradeRequest: UpgradeRequest = new UpgradeRequest(room.controller.id);
			room.memory.Requests.push(newUpgradeRequest);
		} else {
			console.log(
				room.name + 'does not have a controller. \n' + 'No permanent UpgradeRequest created for this room.'
			);
		}
	}

	// Checks if harvesters are assigned to mining sites ==============================================================
	private static monitorMiningSites(room: Room): void {
		const miningFlags: Flag[] = room.find(FIND_FLAGS, {
			filter: (f) => {
				return f.name.includes('mining');
			},
		});

		for (const f of miningFlags) {
			if (f.memory.assignedHarvester && Game.getObjectById(f.memory.assignedHarvester.id) === null) {
				delete f.memory.assignedHarvester;
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

	// Checks if upgrader is assigned to upgrade site =================================================================
	private static monitorUpgradeSite(room: Room): void {
		const upgradeFlag: Flag = room.find(FIND_FLAGS, {
			filter: (f) => {
				return f.name.includes('upgrade');
			},
		})[0];

		if (
			upgradeFlag.memory.assignedUpgrader &&
			Game.getObjectById(upgradeFlag.memory.assignedUpgrader.id) === null
		) {
			delete upgradeFlag.memory.assignedUpgrader;
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

	// Manages the creep count of each role in the room ===============================================================
	private static createSpawnRequests(room: Room): void {
		if (room.isHarvesterNeeded()) {
			room.createSpawnRequest('harvester');
		}

		if (room.isUpgraderNeeded()) {
			room.createSpawnRequest('upgrader');
		}

		if (room.isWorkerNeeded()) {
			room.createSpawnRequest('worker');
		}

		if (room.isTransporterNeeded()) {
			room.createSpawnRequest('transporter');
		}

		if (room.isJanitorNeeded()) {
			room.createSpawnRequest('janitor');
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
			if (target === null) {
				throw new Error('Target of TransportRequest does not exist (anymore)');
			}
			if (target) {
				const targetIsFull: boolean = target.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
				if (
					targetIsFull ||
					// We need to check towers seperately, since they can expend energy at the same tick they got filled
					// @ts-ignore: Object is possibly 'null'.
					(target.structureType === STRUCTURE_TOWER && target.store.getFreeCapacity() === 10)
				) {
					// Set assigned Creeps to idle
					for (const creepPair of r.assignedCreeps) {
						const creep: Creep = Game.creeps[creepPair[0]];
						creep.memory.isIdle = true;
					}
					// Delete the Request
					const index = room.memory.Requests.indexOf(r, 0);
					room.memory.Requests.splice(index, 1);
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

			switch (conSite.structureType) {
				case STRUCTURE_EXTENSION: {
					buildPriority = BUILD_PRIORITIES.STRUCTURE_EXTENSION;
					break;
				}
				case STRUCTURE_TOWER: {
					buildPriority = BUILD_PRIORITIES.STRUCTURE_TOWER;
					break;
				}
				case STRUCTURE_STORAGE: {
					buildPriority = BUILD_PRIORITIES.STRUCTURE_STORAGE;
					break;
				}
				case STRUCTURE_CONTAINER: {
					buildPriority = BUILD_PRIORITIES.STRUCTURE_CONTAINER;
					break;
				}
				default: {
					buildPriority = 0;
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
				room.memory.Requests.splice(index, 1);
			}
		}
	}
}
