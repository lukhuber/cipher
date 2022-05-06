import { Request } from '.././request/Request'

export class Memory {
	static init(room: Room): void {
		room.memory.Requests = new Array<Request>();
	}
}