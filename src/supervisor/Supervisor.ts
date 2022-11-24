import { RefuelTask, UpgradeTask } from '.././task/Task';
import { runRefuel, runUpgrade } from '.././task/Tasks';
import { SpawnRequest, TransportRequest } from '.././request/Request';
import { getBodyParts, getNewCreepName } from '.././utils/utilsSpawner';

// The Supervisor converts Requests to Tasks and assigns the to creeps ################################################
export class Supervisor {
	static init(room: Room): void {
		Supervisor.validateTasks(room);		// Check if Tasks are still fullfillable. Creep could have died already
		Supervisor.assignRefuelTask(room);	// Assign RefuelTask to empty Creeps
		Supervisor.assignUpgradeTask(room); // Assign UpgradeTask to upgraders (always) and workers (if no other tasks are pending)
	}

	static run(room: Room): void {
		Supervisor.doSpawnRequests(room);	// Execute pending SpawnRequests from Manager
		Supervisor.driveHarvesters(room); 	// Makes the harvesters go mining sources
		Supervisor.runTasks(room);			// Cycles through all creeps of this room and run their tasks
	}

	private static validateTasks(room: Room): void {
		const tasks: Task[] = room.getTasks();

		for (const task of tasks) {
			const creep: Creep | undefined = Game.creeps[task.creepName];

			// Delete associated task of this creep, because it died while doing the task -----------------------------
			if (creep === undefined) {
				const index: number = room.memory.Tasks.indexOf(task);
				room.memory.Tasks.splice(index, 1);
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

	private static assignUpgradeTask(room: Room): void {
		var numberOfOtherTasks: number = 0;
		const otherTaskTypes: string[] = ["build"]		// Types of other Tasks which have priority over upgrading
		const upgraders: Creep[] = room.getCreepsByRole('upgrader');
		var creeps: Creep[] = upgraders;
		
		for (const type of otherTaskTypes) {
			numberOfOtherTasks += room.getNumberOfTasksByType(type);
		}

		// Only include workers, if no other tasks are pending --------------------------------------------------------
		if (numberOfOtherTasks === 0) {
			const workers: Creep[] = room.getCreepsByRole('worker');
			creeps = upgraders.concat(workers)
		}

		for (const c of creeps) {
			if (c.memory.isIdle && c.store.getUsedCapacity() != 0) {
				const uTask: UpgradeTask = new UpgradeTask(c.name);
				room.memory.Tasks.push(uTask);
			}
		}
	}

	private static runTasks(room: Room): void {
		const tasks: Task[] = room.memory.Tasks;

		for (const task of tasks) {
			if (task.type === 'refuel') {
				runRefuel(task);
			} else if (task.type === 'upgrade') {
				runUpgrade(task);
			}
		}
	}
}
