import { runRefuel, runUpgrade } from '.././task/Tasks';
import { SpawnRequest, TransportRequest, UpgradeRequest } from '.././request/Request';
import { triageRequest } from '.././request/Requests';
import { getBodyParts, getNewCreepName } from '.././utils/utilsSpawner';

// The Supervisor converts Requests to Tasks and assigns the to creeps ################################################
export class Supervisor {
	static init(room: Room): void {
		Supervisor.refuelIdleCreeps(room);				// Refuels each Creep before assigning a new request
		Supervisor.assignRequests(room);				// Assign the next most important Request to all Creeps
	}

	static run(room: Room): void {
		Supervisor.doSpawnRequests(room);	// Execute pending SpawnRequests from Manager
		Supervisor.driveHarvesters(room); 	// Makes the harvesters go mining sources
		Supervisor.runTasks(room);			// Cycles through all creeps of this room and run their tasks
	}

	// All creeps not complete full and set to idle are filled, before a new Request is assigned to them ==============
	private static refuelIdleCreeps(room: Room): void {
		const creeps: Creep[] = room.getCreeps();

		for (const creep of creeps) {
			// Skip creep if he has something to do -------------------------------------------------------------------
			if (!creep.memory.isIdle) {
				delete creep.memory.refuelTargetId;
				continue;
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
					console.log ('No target to refuel ' + creep.name + ' could be found!');
				}

				const target: Structure | Resource = Game.getObjectById(creep.memory.refuelTargetId);
				creep.getEnergy(target);
			}
		}

	}

	// A full and idle creep is assigned a new Request ================================================================
	private static assignRequests(room: Room): void {
		let requests: Request[] = room.getCreepRequests();
		requests = _.sortBy(requests, 'priority').reverse();	// Sort request by priority

		const upgraders: Creep[] = room.getCreepsByRole('upgrader');
		const workers: Creep[] = room.getCreepsByRole('worker');

		// Assign the obligatory upgradeRequest of each room to all upgraders -----------------------------------------
		for (const u of upgraders) {
			if (!u.memory.isIdle || u.store.getFreeCapacity() > 0) {	// Skip this creep, if he isn't idle or full
				continue;
			}

			const upgradeRequest: Request[] = room.getRequestsByType('upgrade');
			const currentEnergy: number = u.store.getUsedCapacity(RESOURCE_ENERGY);
			upgradeRequest[0].assignedCreeps.push([u.name, currentEnergy])
			upgradeRequest[0].outboundEnergy += currentEnergy;
			u.memory.isIdle = false
		}

		// Assign the top most Request to the next worker, if that Request is not yet satisfied by other workers ------
		for (const w of workers) {
			if (!w.memory.isIdle || w.store.getFreeCapacity() > 0) {	// Skip this creep, if he isn't idle or full
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
				upgradeRequest[0].assignedCreeps.push([w.name, currentEnergy])
				upgradeRequest[0].outboundEnergy += currentEnergy;
				w.memory.isIdle = false
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
		const storesAreFilled: boolean = room.energyAvailable === room.energyCapacityAvailable;

		if (storesAreFilled) {
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
			if (!workerIsAvailable && h.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
				const spawn = h.room.find(FIND_MY_SPAWNS, {
					filter: (s) => {
						return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					},
				})[0];
				h.fillSpawn(spawn);
				continue;
			}

			h.harvestSource();
			h.memory.isIdle = false;
		}
	}

	private static runTasks(room: Room): void {
		const requests: Request[] = room.memory.Requests;

		for (const request of requests) {
			triageRequest(request);
		}
	}

}
