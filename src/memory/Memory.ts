export class Memory {
	static init(room: Room): void {
		room.memory.Requests = new Array<Request>();
	}
}