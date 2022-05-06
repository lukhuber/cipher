import { Request } from '.././request/Request'

export class Console {
	static init (): void {
		global.clearAllRequests = this.clearAllRequests
		global.reportAllRequests = this.reportAllRequests
	}

	static clearAllRequests(roomName?: string): void {
		if (roomName) {
			Game.rooms[roomName].memory.Requests = new Array<Request>();
			console.log('Cleared all requests of room', roomName)
		} else {
			for (let r in Game.rooms)
				Game.rooms[r].memory.Requests = new Array<Request>();
				console.log('Cleared all request in all rooms')
		}
	}

	static reportAllRequests(roomName?: string): void {
		if (roomName) {
			console.log('Report of all requests for room', roomName, '\n')

			Console.reportSpawnRequests(roomName);
		} else {
			console.log('Report of all requests for all rooms\n')

			Console.reportSpawnRequests();
		}
	}

	static reportSpawnRequests(roomName?: string): void {
		console.log("\n",
				"\tSpawn requests\n",
				"╔══════╤═════════════╤══════════╗\n",
				"║ room │ role        │ priority ║\n")

		if (roomName) {
			const spawnRequests: Request[] = Game.rooms[roomName].memory.Requests
			spawnRequests.filter(r => r.type === 'spawn')
			spawnRequests.sort(r => r.priority)

			for (let s of spawnRequests) {
				console.log("║", roomName, "│", s.role, "│", s.priority, "║\n")
			}
		} else {
			for (let r in Game.rooms) {
				const room = Game.rooms[r]
				const spawnRequests: Request[] = room.memory.Requests
				spawnRequests.filter(r => r.type === 'spawn')
				spawnRequests.sort(r => r.priority)

				for (let s of spawnRequests) {
					console.log("║", room.name, "│", s.role, "│", s.priority, "║\n")
				}
			}
		}
		console.log("╚══════╧═════════════╧══════════╝")
	}
} 