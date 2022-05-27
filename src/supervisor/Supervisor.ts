import { SpawnRequest, TransportRequest } from '.././request/Request';
import { getBodyParts, getNewCreepName } from '.././utils/utilsSpawner';

export class Supervisor {
	static init(room: Room): void {
		Supervisor.doSpawnRequests(room); // This should be maybe put somewhere else. Maybe Supervisor.run()?
	}

	static run(room: Room): void {
		Supervisor.driveHarvesters(room); // Makes the harvesters go mining sources
	}

	private static doSpawnRequests(room: Room): boolean {
		const requests: Request[] = room.getSpawnRequests();

		if (requests.length === 0) {
			return true;
		}

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

			// Now delete the processed spawn request ------------------------------------------------------------------------
			const index: number = room.memory.Requests.indexOf(nextTask);
			room.memory.Requests.splice(index, 1);
		}

		return true;
	}

	private static driveHarvesters(room: Room): void {
		const harvesters: Creep[] = room.getCreepsByRole('harvester');
		const workerIsAvailable: boolean = room.getCreepsByRole('worker').length > 0;

		for (const h of harvesters) {
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
}
