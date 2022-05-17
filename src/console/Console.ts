import { Request } from '.././request/Request';

export class Console {
	static init(): void {
		global.help = this.help;
		global.clearAllRequests = this.clearAllRequests;
		global.report = this.report;
	}

	static help(): string {
		let helpMessage: string = ''

		helpMessage += 'cipher v0.0.1 \n\n'

		helpMessage += 'help()                        This Message\n'
		helpMessage += 'report(roomName?)             Creates a report of all requests (in a room)\n'
		helpMessage += 'clearAllRequests(roomName?)   Deletes all requests (in a room)\n'

		return(helpMessage)
	}

	static clearAllRequests(roomName?: string): void {
		if (roomName) {
			Game.rooms[roomName].memory.Requests = new Array<Request>();
			console.log('Cleared all requests of room', roomName);
		} else {
			for (const r in Game.rooms) {
				Game.rooms[r].memory.Requests = new Array<Request>();
				console.log('Cleared all request in all rooms');
			}
		}
	}

	static report(roomName?: string): void {
		if (roomName) {
			console.log('Report of all requests for room', roomName, '\n');
			Console.reportSpawnRequests(roomName);
		} else {
			console.log('Report of all requests for all rooms\n');

			Console.reportSpawnRequests();
		}
	}

	static reportSpawnRequests(roomName?: string): void {
		let report: string =
			'\n' + '\tSpawn requests\n' + '╔════════╤═════════════╤══════════╗\n' + '║ ROOM   │ ROLE        │ PRIORITY ║\n';

		if (roomName) {
			let spawnRequests: Request[] = _.filter(Game.rooms[roomName].memory.Requests, (r) => r.type === 'spawn');
			spawnRequests = _.sortBy(spawnRequests, (r) => r.priority, 'desc');

			for (const s of spawnRequests) {
				if (typeof s.role === 'string') {
					report +=
						'║ ' +
						roomName.padEnd(6, ' ') +
						' │ ' +
						s.role.padEnd(11, ' ') +
						' │ ' +
						s.priority.toString().padEnd(8, ' ') +
						' ║\n';
				} else {
					throw new Error('Property "role" of spawn request is not type "string"!');
				}
			}
		} else {
			for (const r in Game.rooms) {
				const room = Game.rooms[r];
				let spawnRequests: Request[] = _.filter(room.memory.Requests, (r) => r.type === 'spawn');
				spawnRequests = _.sortBy(spawnRequests, (r) => r.priority, 'desc');

				for (const s of spawnRequests) {
					if (typeof s.role === 'string') {
						report +=
							'║ ' +
							room.name.padEnd(6, ' ') +
							' │ ' +
							s.role.padEnd(11, ' ') +
							' │ ' +
							s.priority.toString().padEnd(8, ' ') +
							' ║\n';
					} else {
						throw new Error('Property "role" of spawn request is not type "string"!');
					}
				}
			}
		}
		report += '╚════════╧═════════════╧══════════╝';
		console.log(report);
	}
}
