export class Memory {
	static init(room: Room): void {
		room.memory.Requests = new Array<Request>();
		room.memory.Tasks = new Array<Task>();
	}
}