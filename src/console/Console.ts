import { SpawnRequest, TransportRequest } from '.././request/Request';

export class Console {
	// Provides the commands to the game console ======================================================================
	static init(): void {
		global.help = this.help;
		global.report = this.report;
		global.clearAllRequests = this.clearAllRequests;
		global.setCreepsToIdle = this.setCreepsToIdle;
	}

	// Help message explaining all available commands =================================================================
	static help(): string {
		let helpMessage: string = '';

		helpMessage += 'cipher v0.0.2 \n\n';

		helpMessage += 'help()                        This Message\n';
		helpMessage += 'report(roomName?)             Creates a report of all requests (in a room)\n';
		helpMessage += 'clearAllRequests(roomName?)   Deletes all requests (in a room)\n';
		helpMessage += 'setCreepsToIdle(roomName?)	  Sets all creeps (in a room) to idle\n'

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

	// Creates a report of all requests and tasks. Can be limited to a single room ====================================
	static report(roomName?: string): string {
		let report: string = '';
		if (roomName) {
			report += Console.reportBuildingRequests(roomName);
			report += Console.reportCreepRequests(roomName);
		} else {
			report += Console.reportBuildingRequests();
			report += Console.reportCreepRequests();
		}

		return report;
	}

	static reportBuildingRequests(roomName?: string): string {
		const reportHeader: string = '--- REQUESTS DONE BY BUILDINGS -------------------------------------------------------------------- \n' +
									 '╔══════════╦═══════════╦═══════════╗ \n' +
							         '║ PRIORITY ║ TYPE      ║ ROLE      ║ \n';
		let reportBody: string = ''
		const reportFooter: string = '╚══════════╩═══════════╩═══════════╝ \n'

		if (roomName) {
			const requests: Request[] = Game.rooms[roomName].getBuildingRequests();
			reportBody += this.parseBuildingRequests(requests);
		} else {
			for (const i in Game.rooms) {
				const requests: Request[] = Game.rooms[i].getBuildingRequests();
				reportBody += this.parseBuildingRequests(requests);
			}
		}

		return reportHeader + reportBody + reportFooter;
	}

	private static parseBuildingRequests(requests: Request[]): string {
		let requestSummary: string = '';
		requests = _.sortBy(requests, 'priority').reverse();
		for (const request of requests) {

			requestSummary += '║ ' + request.priority.toString().padEnd(9, ' ') +
							  '║ ' + request.type.padEnd(10, ' ') +
							  '║ ' + request.role.padEnd(10, ' ') +
							  '║\n';
		}
		return requestSummary;
	}

	static reportCreepRequests(roomName?: string): string {
		const reportHeader: string = '--- REQUESTS DONE BY CREEPS ----------------------------------------------------------------------- \n' +
									 '╔══════════╦═══════════╦═════════════════╦═══════════════╦═════════════╦══════════════════════════╗ \n' +
							         '║ PRIORITY ║ TYPE      ║ OUTBOUND ENERGY ║ NEEDED ENERGY ║ TARGET TYPE ║ TARGET ID                ║ \n';
		let reportBody: string = ''
		const reportFooter: string = '╚══════════╩═══════════╩═════════════════╩═══════════════╩═════════════╩══════════════════════════╝ \n'

		if (roomName) {
			const requests: Request[] = Game.rooms[roomName].getCreepRequests();
			reportBody += this.parseCreepRequests(requests);
		} else {
			for (const i in Game.rooms) {
				const requests: Request[] = Game.rooms[i].getCreepRequests();
				reportBody += this.parseCreepRequests(requests);
			}
		}

		return reportHeader + reportBody + reportFooter;
	}

	private static parseCreepRequests(requests: Request[]): string {
		let requestSummary: string = '';
		requests = _.sortBy(requests, 'priority').reverse();
		for (const request of requests) {

			requestSummary += '║ ' + request.priority.toString().padEnd(9, ' ') +
							  '║ ' + request.type.padEnd(10, ' ') +
							  '║ ' + request.outboundEnergy.toString().padEnd(16, ' ') +
							  '║ ' + request.neededEnergy.toString().padEnd(14, ' ') +
							  // @ts-ignore: Object is possibly 'null'.
							  '║ ' + Game.getObjectById(request.targetId).structureType.padEnd(12, ' ') +
							  '║ ' + request.targetId.padEnd(25, ' ') +
							  '║\n';
		}
		return requestSummary;
	}

	static setCreepsToIdle(roomName?: string): string {
		let creeps: Creep[] = [];

		if (roomName) {
			creeps = Game.rooms[roomName].getCreeps();
		} else {
			for (const i in Game.creeps) {
				creeps.push(Game.creeps[i]);
			}
		}

		for (const creep of creeps) {
			creep.memory.isIdle = true;
		}

		return 'Creeps set to idle';
	}
}
