import { Request } from '.././request/Request'

export class Console {
	static init (): void {
		global.clearAllRequests = this.clearAllRequests
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
} 