import { SpawnRequest, TransportRequest } from '.././request/Request';

export class Console {
	// Provides the commands to the game console ======================================================================
	static init(): void {
		global.help = this.help;
		global.report = this.report;
		global.clearAllRequests = this.clearAllRequests;
		global.clearAllTasks = this.clearAllTasks;
	}

	// Help message explaining all available commands =================================================================
	static help(): string {
		let helpMessage: string = '';

		helpMessage += 'cipher v0.0.2 \n\n';

		helpMessage += 'help()                        This Message\n';
		helpMessage += 'report(roomName?)             Creates a report of all requests (in a room)\n';
		helpMessage += 'clearAllRequests(roomName?)   Deletes all requests (in a room)\n';
		helpMessage += 'clearAllTasks(roomName?)	  Deletes all tasks (in a room) and sets affected creeps to idle\n';

		return helpMessage;
	}

	// Used to clear all Request. Can be limited to a single room, if room name is provided as string =================
	static clearAllRequests(roomName?: string): string {
		if (roomName) {
			Game.rooms[roomName].memory.Requests = new Array<Request>();
			return 'Cleared all requests of room ' + roomName;
		} else {
			for (const r in Game.rooms) {
				Game.rooms[r].memory.Requests = new Array<Request>();
				return 'Cleared all request in all rooms';
			}
		}

		return 'Error while trying to clear requests!';
	}

	// Used to clear all Tasks. Can be limited to a single room, if room name is provided as string ===================
	static clearAllTasks(roomName?: string): string {
		if (roomName) {
			const creeps: Creep[] = Game.rooms[roomName].getCreeps();
			for (const c of creeps) {
				c.memory.isIdle = true
			}

			Game.rooms[roomName].memory.Tasks = new Array<Task>();
			return 'Cleared all tasks of room ' + roomName;
		} else {
			for (const r in Game.rooms) {
				const creeps: Creep[] = Game.rooms[r].getCreeps();
				for (const c of creeps) {
					c.memory.isIdle = true
				}

				Game.rooms[r].memory.Tasks = new Array<Task>();
				return 'Cleared all tasks in all rooms';
			}
		}

		return 'Error while trying to clear tasks!'
	}

	// Creates a report of all requests and tasks. Can be limited to a single room ====================================
	static report(roomName?: string): string {
		let report: string = '';
		if (roomName) {
			report += 'Report of all requests for room ' + roomName + '\n';
			report += Console.reportSpawnRequests(roomName);
			report += Console.reportTransportRequests(roomName);
		} else {
			report += 'Report of all requests for all rooms\n';
			report += Console.reportSpawnRequests();
			report += Console.reportTransportRequests();
		}

		return report;
	}

	// Helper function for report(). Handles visualization all SpawnRequests ==========================================
	static reportSpawnRequests(roomName?: string): string {
		let report: string =
			'\n' + '\tSpawn requests\n' + '╔════════╤═════════════╤══════════╗\n' + '║ ROOM   │ ROLE        │ PRIORITY ║\n';

		if (roomName) {
			let spawnRequests: Request[] = Game.rooms[roomName].getSpawnRequests();
			spawnRequests = _.sortBy(spawnRequests, (r) => r.priority, 'desc');

			for (const s of spawnRequests) {
				report +=
					'║ ' +
					roomName.padEnd(6, ' ') +
					' │ ' +
					s.role.padEnd(11, ' ') +
					' │ ' +
					s.priority.toString().padEnd(8, ' ') +
					' ║\n';
			}
		} else {
			for (const r in Game.rooms) {
				const room = Game.rooms[r];
				let spawnRequests: Request[] = room.getSpawnRequests();
				spawnRequests = _.sortBy(spawnRequests, (r) => r.priority, 'desc');

				for (const s of spawnRequests) {
					report +=
						'║ ' +
						room.name.padEnd(6, ' ') +
						' │ ' +
						s.role.padEnd(11, ' ') +
						' │ ' +
						s.priority.toString().padEnd(8, ' ') +
						' ║\n';
				}
			}
		}
		report += '╚════════╧═════════════╧══════════╝\n';
		return report;
	}

	// Helper function for report(). Handles visualization of all TransportRequests ===================================
	static reportTransportRequests(roomName?: string): string {
		let report: string =
			'\n' +
			'\tTransport requests\n' +
			'╔════════╤═════════════╤══════════╗\n' +
			'║ ROOM   │ TARGET      │ PRIORITY ║\n';

		if (roomName) {
			let transportRequests: Request[] = Game.rooms[roomName].getTransportRequests();
			transportRequests = _.sortBy(transportRequests, (r) => r.priority, 'desc');

			for (const t of transportRequests) {
				report += 
				'║ ' + 
				roomName.padEnd(6, ' ') + 
				' │ ' + 
				t.target.structureType.padEnd(11, ' ') + 
				' │ ' + 
				t.priority.toString().padEnd(8, ' ') + 
				' ║\n';
			}
		} else {
			for (const r in Game.rooms) {
				const room = Game.rooms[r];
				let transportRequests: Request[] = room.getTransportRequests();
				transportRequests = _.sortBy(transportRequests, (r) => r.priority, 'desc');

				for (const t of transportRequests) {
					report +=
						'║ ' +
						room.name.padEnd(6, ' ') +
						' │ ' +
						t.target.structureType.padEnd(11, ' ') +
						' │ ' +
						t.priority.toString().padEnd(8, ' ') +
						' ║\n';
				}
			}
		}

		report += '╚════════╧═════════════╧══════════╝\n';
		return report;
	}
}
