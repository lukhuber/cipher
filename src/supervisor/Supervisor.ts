import { runRefuel, runUpgrade } from '.././task/tasks';
import { SpawnRequest, TransportRequest, UpgradeRequest } from '.././request/Request';
import { triageRequest } from '.././request/requests';
import { getBodyParts, getNewCreepName } from '.././utils/utilsSpawner';
import { STORAGE_LEVEL_THRESHOLD } from '.././settings';

// The Supervisor converts Requests to Tasks and assigns them to creeps ###############################################
export class Supervisor {
	static init(room: Room): void {
		Supervisor.refuelIdleCreeps(room); // Refuels each Creep before assigning a new request
		Supervisor.assignRequests(room); // Assign the next most important Request to all Creeps
	}

	static run(room: Room): void {
		Supervisor.doSpawnRequests(room); // Execute pending SpawnRequests from Manager
		Supervisor.driveHarvesters(room); // Makes the harvesters go mining sources
		Supervisor.driveTransporters(room); // Transport energy away from mining sites to where it's needed
		Supervisor.driveJanitors(room); // Makes sure, that spawn + extensions are filled
		Supervisor.runTasks(room); // Cycles through all creeps of this room and run their tasks

		Supervisor.runTowers(room); // Makes sure, that Towers repair owned structures
	}

	// All creeps completely emtpy and set to idle are filled, before a new Request is assigned to them ===============
	private static refuelIdleCreeps(room: Room): void {
		const creeps: Creep[] = room.getCreeps();
		const buildRequestCount: number = room.getRequestsByType('build').length;
		const transportRequestCount: number = room.getRequestsByType('transport').length;
		const transporterPresent: boolean = room.getCreepsByRole('transporter').length > 0 ? true : false;

		for (const creep of creeps) {
			// Skip creep if he has something to do or is not completely empty ----------------------------------------
			// We also want to skip transporters and janitors, as they have their own logic
			if (!creep.memory.isIdle || creep.store.getUsedCapacity() != 0) {
				delete creep.memory.refuelTargetId;
				continue;
			} else if (creep.memory.role === 'transporter' || creep.memory.role === 'janitor') {
				continue;
			}

			// If the target is empty, we want to delete it -----------------------------------------------------------
			if (creep.memory.refuelTargetId) {
				const target = Game.getObjectById(creep.memory.refuelTargetId);
				if (
					(target instanceof StructureContainer || target instanceof StructureStorage) &&
					target.store.getUsedCapacity(RESOURCE_ENERGY) === 0
				) {
					delete creep.memory.refuelTargetId;
				}
			}

			// Upgrader should use the upgrade container if possible ---------------------------------------------------
			if (creep.memory.role === 'upgrader' && room.memory.containersBuilt && transporterPresent) {
				creep.memory.refuelTargetId = room.memory.upgradeContainer;
			}

			// Workers should refuel at the storage when not upgrading ------------------------------------------------
			// We make sure, that there is STOARGE_LEVEL_THRESHOLD in storage, before taking it, so that the janitor has enough
			// energy to still fill spawn + extensions
			let storageLevel: number = 0;
			if (room.memory.storage) {
				storageLevel = Game.getObjectById(room.memory.storage).store.getUsedCapacity(RESOURCE_ENERGY);
			}

			if (creep.memory.role === 'worker' && room.memory.containersBuilt && transporterPresent) {
				if (buildRequestCount > 0 && storageLevel >= STORAGE_LEVEL_THRESHOLD) {
					creep.memory.refuelTargetId = room.memory.storage;
				} else if (transportRequestCount > 0 && !room.memory.janitorPresent) {
					creep.memory.refuelTargetId = room.memory.storage;
				} else if (buildRequestCount > 0 && storageLevel < STORAGE_LEVEL_THRESHOLD) {
					// Workers should travel near the storage to refuel if there is something to build, but the storage is not full
					// They then leave some space around the storage. This prevents workers from clogging up the bunker
					const storage = Game.getObjectById(room.memory.storage);
					const moveAwayPosition = new RoomPosition(
						storage.pos.x + 4,
						storage.pos.y + 4,
						room.name
					);
					creep.moveTo(moveAwayPosition);
					continue;
				} else {
					creep.memory.refuelTargetId = room.memory.upgradeContainer;
				}
			}

			// In case the target (dropped energy) has vanished it needs to be removed --------------------------------
			if (creep.memory.refuelTargetId != undefined) {
				if (Game.getObjectById(creep.memory.refuelTargetId) === null) {
					delete creep.memory.refuelTargetId;
				}
			}

			if (!creep.memory.refuelTargetId) {
				creep.memory.refuelTargetId = room.getRefuelTargetId();
			} else {
				if (creep.memory.refuelTargetId === undefined) {
					console.log('No target to refuel ' + creep.name + ' could be found!');
				}

				const target: Structure | Resource = Game.getObjectById(creep.memory.refuelTargetId);
				creep.getEnergy(target);
			}
		}
	}

	// A not empty and idle creep is assigned a new Request ===========================================================
	private static assignRequests(room: Room): void {
		let requests: Request[] = room.getCreepRequests();
		requests = _.sortBy(requests, 'priority').reverse(); // Sort request by priority

		// Following code orders the subset of build requests of 'requests' depending on buildPriority ----------------
		let bTemp: Request[] = Array.from(requests); // Necessary, to not manipulate the original array 'requests'
		bTemp = bTemp
			.filter((r) => r.type === 'build')
			.sort((a, b) => a.buildPriority - b.buildPriority)
			.reverse();

		const firstBuildRequest: Request = requests.find((r) => r.type === 'build');
		const firstBuildRequestIndex: number = requests.indexOf(firstBuildRequest);

		requests.splice(firstBuildRequestIndex, bTemp.length, ...bTemp);

		// Following code orders the subset of transport requests of 'requests depending on transportPriority'
		let tTemp: Request[] = Array.from(requests); // Necessary, to not manipulate the original array 'requests'
		tTemp = tTemp
			.filter((r) => r.type === 'transport')
			.sort((a, b) => a.transportPriority - b.transportPriority)
			.reverse();

		const firstTransportRequest: Request = requests.find((r) => r.type === 'transport');
		const firstTransportRequestIndex: number = requests.indexOf(firstTransportRequest);

		requests.splice(firstTransportRequestIndex, tTemp.length, ...tTemp);

		// If a janitor is present, we don't want workers to do transport requests ------------------------------------
		if (room.memory.janitorPresent) {
			requests = requests.filter((r) => r.type != 'transport');
		}

		// Get number of current creeps in each role for later use ----------------------------------------------------
		const upgraders: Creep[] = room.getCreepsByRole('upgrader');
		const workers: Creep[] = room.getCreepsByRole('worker');
		const transporters: Creep[] = room.getCreepsByRole('transporter');

		// Assign the obligatory upgradeRequest of each room to all upgraders -----------------------------------------
		for (const u of upgraders) {
			if (!u.memory.isIdle || u.store.getUsedCapacity() === 0) {
				// Skip this creep, if he isn't idle or empty
				continue;
			}

			const upgradeRequest: Request[] = room.getRequestsByType('upgrade');
			const currentEnergy: number = u.store.getUsedCapacity(RESOURCE_ENERGY);
			upgradeRequest[0].assignedCreeps.push([u.name, currentEnergy]);
			upgradeRequest[0].outboundEnergy += currentEnergy;
			u.memory.isIdle = false;
		}

		// Assign the top most Request to the next worker, if that Request is not yet satisfied by other workers ------
		for (const w of workers) {
			if (!w.memory.isIdle || w.store.getUsedCapacity() === 0) {
				// Skip this creep, if he isn't idle or empty
				continue;
			}

			for (const request of requests) {
				if (request.outboundEnergy < request.neededEnergy) {
					const currentEnergy: number = w.store.getUsedCapacity(RESOURCE_ENERGY);

					request.assignedCreeps.push([w.name, currentEnergy]);
					request.outboundEnergy += currentEnergy;
					w.memory.isIdle = false;
					break;
				}
			}

			// If no creep is not assigned at this point, assign it to do upgradeRequest ------------------------------
			if (w.memory.isIdle) {
				const upgradeRequest: Request[] = room.getRequestsByType('upgrade');
				const currentEnergy: number = w.store.getUsedCapacity(RESOURCE_ENERGY);
				upgradeRequest[0].assignedCreeps.push([w.name, currentEnergy]);
				upgradeRequest[0].outboundEnergy += currentEnergy;
				w.memory.isIdle = false;
			}
		}

		if (workers.length > 0) {
			// Skip the rest if workers are present.
			return;
		}

		const harvesters: Creep[] = room.getCreepsByRole('harvester');

		// If no workers are present harvesters should do transport requests ------------------------------------------
		for (const h of harvesters) {
			if (h.memory.isIdle || h.store.getFreeCapacity() != 0) {
				// Skip this creep, if it's empty
				continue;
			}
			const transportRequests: Request[] = room.getRequestsByType('transport');

			for (const t of transportRequests) {
				if (t.outboundEnergy < t.neededEnergy) {
					const currentEnergy: number = h.store.getUsedCapacity(RESOURCE_ENERGY);

					t.assignedCreeps.push([h.name, currentEnergy]);
					t.outboundEnergy += currentEnergy;
					h.memory.isIdle = true;
					break;
				}
			}
		}
	}

	private static doSpawnRequests(room: Room): void {
		const requests: Request[] = room.getSpawnRequests();

		// Nothing to do, when no requests are existing ---------------------------------------------------------------
		if (requests.length === 0) {
			return;
		}

		// If spawn + all extensions are filled, process the next spawnRequest ----------------------------------------
		// If no workers are present, spawn a basic harvester to ensure that colony is not failing completely
		const storesAreFilled: boolean = room.energyAvailable === room.energyCapacityAvailable;
		const noWorkersPresent: boolean = room.getCreepsByRole('worker').length === 0 ? true : false

		if (storesAreFilled || noWorkersPresent) {
			const spawn: StructureSpawn = room.find(FIND_MY_SPAWNS)[0];
			const nextTask: Request = _.max(requests, 'priority');

			if (nextTask.role === undefined) {
				throw new Error('Spawn request has no role specified!');
			}

			const role: string = nextTask.role;

			spawn.spawnCreep(getBodyParts(role, room), getNewCreepName(role), {
				memory: { role: role, home: room.name, isIdle: true },
			});

			// Now delete the processed spawn request -----------------------------------------------------------------
			const index: number = room.memory.Requests.indexOf(nextTask);
			room.memory.Requests.splice(index, 1);
		}
	}

	private static driveHarvesters(room: Room): void {
		const harvesters: Creep[] = room.getCreepsByRole('harvester');
		const workerIsAvailable: boolean = room.getCreepsByRole('worker').length > 0;

		for (const h of harvesters) {
			// When no worker is available, fill spawn when creep is full ---------------------------------------------
			if (!workerIsAvailable && h.store.getFreeCapacity() === 0) {
				continue;
			}

			h.harvestSource();
			h.memory.isIdle = false;
		}
	}

	private static driveTransporters(room: Room): void {
		const transporters: Creep[] = room.getCreepsByRole('transporter');

		const storage: StructureStorage | StructureContainer = Game.getObjectById(room.memory.storage);
		let storageLevel: number = 0;

		const upgradeContainer: StructureContainer = Game.getObjectById(room.memory.upgradeContainer);
		let upgradeContainerLevel: number = 0;

		if (storage && upgradeContainer) {
			storageLevel = storage.store.getUsedCapacity(RESOURCE_ENERGY);
			upgradeContainerLevel = upgradeContainer.store.getUsedCapacity(RESOURCE_ENERGY);
		}

		const miningContainers = new Array<StructureContainer>();

		// Get mining containers in an array, for later use
		for (const id of room.memory.miningContainers) {
			if (id) {
				const container = Game.getObjectById(id);

				if (container && container instanceof StructureContainer) {
					miningContainers.push(container);
				}
			}
		}

		let energyTowardsStorage : number = 0; // Used to track how much energy is transported towards storage

		for (const t of transporters) {
			// If the transporter is empty, it should refuel at the mining containers.
			// The transporter also checks, if other transporters are already refueling at the same container
			// and only refuels, if there is enough energy left for itself.
			if (t.store.getUsedCapacity() === 0) {
				if (!t.memory.refuelTargetId) {
					const refuelTarget = _.max(miningContainers, function (c) {
						const otherTransportersCapacity = _.sum(
							_.filter(transporters, (otherT) => otherT.memory.refuelTargetId === c.id),
							(otherT) => otherT.store.getCapacity()
						);
						return c.store.getUsedCapacity() - otherTransportersCapacity;
					});
					if (refuelTarget && refuelTarget.store.getUsedCapacity() >= t.store.getCapacity()) {
						t.memory.refuelTargetId = refuelTarget.id;
					} else {
						t.memory.isIdle = true;
						continue;
					}
				}
				const target = Game.getObjectById(t.memory.refuelTargetId);
				if (t.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					t.moveTo(target);
				}

			// If the transporter is not empty, it should fill storage to at least the threshold, else fill upgrade container
			} else if (t.store.getUsedCapacity() != 0) {
				const buildRequestCount: number = room.getRequestsByType('build').length;
				if (buildRequestCount > 0 || storageLevel + energyTowardsStorage < STORAGE_LEVEL_THRESHOLD) {
					delete t.memory.refuelTargetId;
					if (t.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						t.moveTo(storage);
						energyTowardsStorage += t.store.getUsedCapacity();
					}
				} else {
					delete t.memory.refuelTargetId;
					if (t.transfer(upgradeContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						t.moveTo(upgradeContainer);
					}
				}
			}
		}
	}

	private static driveJanitors(room: Room): void {
		const janitors: Creep[] = room.getCreepsByRole('janitor');
		const storage = Game.getObjectById(room.memory.storage);
		const transportRequests: Request[] = room.getRequestsByType('transport').reverse();

		for (const j of janitors) {
			// Refill janitor, if it's empty and break the loop -------------------------------------------------------
			if (j.store.getUsedCapacity() === 0) {
				j.memory.isIdle = true;
				if (j.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					j.moveTo(storage);
				}
				continue;
			}

			// If the janitor has nothing to do, it should refill itself ----------------------------------------------
			if (transportRequests.length === 0) {
				j.memory.isIdle = true;

				if (j.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					j.moveTo(storage);
				}
			}

			// Skip at this point, if it's not idle, since we don't want to assign it to multiple requests ------------
			if (!j.memory.isIdle || j.store.getUsedCapacity() === 0) {
				continue;
			}

			// Assign the next transport request to the janitor -------------------------------------------------------
			for (const request of transportRequests) {
				if (request.outboundEnergy < request.neededEnergy) {
					const currentEnergy: number = j.store.getUsedCapacity(RESOURCE_ENERGY);

					request.assignedCreeps.push([j.name, currentEnergy]);
					request.outboundEnergy += currentEnergy;
					j.memory.isIdle = false;
					break;
				}
			}
		}
	}

	private static runTasks(room: Room): void {
		const requests: Request[] = room.memory.Requests;

		for (const request of requests) {
			triageRequest(request);
		}
	}

	private static runTowers(room: Room): void {
		const towers: StructureTower[] = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
		const repairTargets: Structure[] = room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (
					(structure.structureType === STRUCTURE_EXTENSION ||
						structure.structureType === STRUCTURE_CONTAINER ||
						structure.structureType === STRUCTURE_STORAGE ||
						structure.structureType === STRUCTURE_ROAD) &&
					structure.hits < structure.hitsMax
				);
			},
		});

		for (const t of towers) {
			if (repairTargets.length > 0) {
				t.repair(repairTargets[0]);
			}
		}
	}
}
