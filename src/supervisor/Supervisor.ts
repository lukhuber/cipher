import { Request } from '.././request/Request'
import { getBodyParts, getNewCreepName } from '.././utils/utilsSpawner'

export class Supervisor {
	static init(room: Room): void {
		Supervisor.doSpawnRequests(room);
	}

	private static doSpawnRequests(room: Room): void {
		const requests: Request[] = _.filter(room.memory.Requests, (r) => r.type === 'spawn');
		const storesAreFilled: boolean = room.energyAvailable === room.energyCapacityAvailable;

		if (storesAreFilled) {
			const spawn: StructureSpawn = room.find(FIND_MY_SPAWNS)[0]
			const nextTask: Request = _.max(requests, 'priority')
			
			if (nextTask.role === undefined) {
				throw new Error('Spawn request has no role specified!')
			}

			const role: string = nextTask.role
			spawn.spawnCreep(getBodyParts(role, room), getNewCreepName(role), {memory: {role: role, home: room.name, isIdle: true}})
		}
	}
}
