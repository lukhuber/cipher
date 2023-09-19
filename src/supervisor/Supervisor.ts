import { runRefuel, runUpgrade } from '.././task/tasks';
import { SpawnRequest, TransportRequest, UpgradeRequest } from '.././request/Request';
import { triageRequest } from '.././request/requests';
import { getBodyParts, getNewCreepName } from '.././utils/utilsSpawner';

// The Supervisor converts Requests to Tasks and assigns them to creeps ###############################################
export class Supervisor {
	static init(room: Room): void {
		Supervisor.refuelIdleCreeps(room);	// Refuels each Creep before assigning a new request
		Supervisor.assignRequests(room);	// Assign the next most important Request to all Creeps
	}

	static run(room: Room): void {
		Supervisor.doSpawnRequests(room);	// Execute pending SpawnRequests from Manager
		Supervisor.driveHarvesters(room); 	// Makes the harvesters go mining sources
		Supervisor.runTasks(room);			// Cycles through all creeps of this room and run their tasks
	}

	// All creeps completely emtpy and set to idle are filled, before a new Request is assigned to them ===============
	private static refuelIdleCreeps(room: Room): void {
		const creeps: Creep[] = room.getCreeps();

		for (const creep of creeps) {
			// Skip creep if he has something to do or is not completely empty ----------------------------------------
			if (!creep.memory.isIdle || creep.store.getUsedCapacity() != 0) {
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

	// A not empty and idle creep is assigned a new Request ===========================================================
	private static assignRequests(room: Room): void {
		let requests: Request[] = room.getCreepRequests();
		requests = _.sortBy(requests, 'priority').reverse();	// Sort request by priority

		const upgraders: Creep[] = room.getCreepsByRole('upgrader');
		const workers: Creep[] = room.getCreepsByRole('worker');
		const transporters: Creep[] = room.getCreepsByRole('transporter');

		// Assign the obligatory upgradeRequest of each room to all upgraders -----------------------------------------
		for (const u of upgraders) {
			if (!u.memory.isIdle || u.store.getUsedCapacity() === 0) {	// Skip this creep, if he isn't idle or empty
				continue;
			}

			const upgradeRequest: Request[] = room.getRequestsByType('upgrade');
			const currentEnergy: number = u.store.getUsedCapacity(RESOURCE_ENERGY);
			upgradeRequest[0].assignedCreeps.push([u.name, currentEnergy])
			upgradeRequest[0].outboundEnergy += currentEnergy;
			u.memory.isIdle = false
		}

		// Assign only transport requests to transporters -------------------------------------------------------------
		for (const t of transporters) {
			if (!t.memory.isIdle || t.store.getUsedCapacity() === 0) {	// Skip this creep, if he isn't idle or empty
				continue;
			}

			const transportRequests: Request[] = room.getRequestsByType('transport');

		}

		// Assign the top most Request to the next worker, if that Request is not yet satisfied by other workers ------
		for (const w of workers) {
			if (!w.memory.isIdle || w.store.getUsedCapacity() === 0) {	// Skip this creep, if he isn't idle or empty
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

		if (workers.length > 0) {	// Skip the rest if workers are present.
			return
		}

		const harvesters: Creep[] = room.getCreepsByRole('harvester');

		// If no workers are present harvesters should do transport requests
		for (const h of harvesters) {
			if (!h.memory.isIdle || h.store.getFreeCapacity() != 0) {	// Skip this creep, if it's empty
				continue;
			}

			const transportRequests: Request[] = room.getRequestsByType('transport');

			for (const t of transportRequests) {
				if (t.outboundEnergy < t.neededEnergy) {
					const currentEnergy: number = h.store.getUsedCapacity(RESOURCE_ENERGY);

					t.assignedCreeps.push([h.name, currentEnergy]);
					t.outboundEnergy += currentEnergy;
					h.memory.isIdle = false;
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
			if (!workerIsAvailable && h.store.getFreeCapacity() === 0) {
				continue;
			}

			h.harvestSource();
			h.memory.isIdle = true;
		}
	}

	private static runTasks(room: Room): void {
		const requests: Request[] = room.memory.Requests;

		for (const request of requests) {
			triageRequest(request);
		}
	}

}
