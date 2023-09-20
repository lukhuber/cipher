export class Memory {
	// Prepares the memory of uninitialized rooms =====================================================================
	static init(room: Room): void {
		room.memory.Requests = new Array<Request>();			// Array used to store all requests of this room
		room.memory.Tasks = new Array<Task>();					// Array used to store all tasks of this room
		room.memory.miningContainers = new Array<Id<_HasId>>; 	// Array used to store the ID of mining containers
	}
}