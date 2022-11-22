import { SpawnRequest, TransportRequest } from '.././request/Request';
import { getBodyParts, getNewCreepName } from '.././utils/utilsSpawner';

export class Supervisor {
	static init(room: Room): void {
		Supervisor.doSpawnRequests(room); 	// This should be maybe put somewhere else. Maybe Supervisor.run()?
		Supervisor.refuelCreeps(room);		// Assign RefuelTask to empty Creeps
	}

	static run(room: Room): void {
		Supervisor.driveHarvesters(room); 	// Makes the harvesters go mining sources
		Supervisor.driveUpgraders(room);	// Makes the upgrader go upgrade the controller
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

	private static driveUpgraders(room: Room): void {
		const upgraders: Creep[] = room.getCreepsByRole('upgrader');
		const harvesters: Creep[] = room.getCreepsByRole('harvester');

		for (const c of upgraders) {
		}
	}

	private static refuelCreeps(room: Room): void {
		const upgraders: Creep[] = room.getCreepsByRole('upgrader');
		const workers: Creep[] = room.getCreepsByRole('worker');

		const creeps: Creep[] = upgraders.concat(workers);

		for (const c of creeps) {
			if (c.store.getUsedCapacity() === 0) {
				const refuelStation: Structure | undefined = room.getRefuelStation();

				if (refuelStation) {
					console.log("foo")
				} else {
					console.log("bar")
				}
			}
		}
	}
}
