import { RefuelTask } from '.././task/Task';
import { runRefuel } from '.././task/Tasks';
import { SpawnRequest, TransportRequest } from '.././request/Request';
import { getBodyParts, getNewCreepName } from '.././utils/utilsSpawner';

export class Supervisor {
	static init(room: Room): void {
		Supervisor.assignRefuelTask(room);	// Assign RefuelTask to empty Creeps
	}

	static run(room: Room): void {
		Supervisor.doSpawnRequests(room);	// Execute pending SpawnRequests from Manager
		Supervisor.driveHarvesters(room); 	// Makes the harvesters go mining sources
		Supervisor.runTasks(room);			// Cycles through all creeps of this room and run their tasks
	}

	private static doSpawnRequests(room: Room) {
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

	private static assignRefuelTask(room: Room): void {
		const upgraders: Creep[] = room.getCreepsByRole('upgrader');
		const workers: Creep[] = room.getCreepsByRole('worker');

		const creeps: Creep[] = upgraders.concat(workers);

		for (const c of creeps) {
			if (c.memory.isIdle && c.store.getUsedCapacity() === 0) {
				const rTask: RefuelTask = new RefuelTask(c.name);
				room.memory.Tasks.push(rTask);
			}
		}
	}

	private static runTasks(room: Room): void {
		const tasks: Task[] = room.memory.Tasks;

		for (const task of tasks) {
			if (task.type === 'refuel') {
				runRefuel(task);
			}
		}
	}
}
