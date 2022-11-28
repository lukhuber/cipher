import { REQUEST_PRIORITIES } from '.././settings';

export class Request {
	type:string;
	priority: number;
	targetId: string;

	constructor (type: string, priority: number, targetId: string) {
		this.type = type;
		this.priority = priority;
		this.targetId = targetId;
	}
}

export class CreepRequest extends Request {
	assignedCreeps: [string, number][];
	neededEnergy: number;
	outboundEnergy: number;

	constructor (type: string, priority: number, targetId: string, neededEnergy: number) {
		super(type, priority, targetId);
		this.assignedCreeps = [];
		this.outboundEnergy = 0;
		this.neededEnergy = neededEnergy;
	}

	run(): void {
		console.log('Requests with type ' + this.type + ' have no behavior programmed in run()!')
	}
}

export class UpgradeRequest extends CreepRequest {
	constructor (controllerId: string) {
		super('upgrade', REQUEST_PRIORITIES.UPGRADE_REQUEST, controllerId, -1)
	}
}

export class SpawnRequest extends Request {
	role: Roles;

	constructor(priority: number, role: Roles) {
		super('spawn', priority, "n/a");
		this.role = role;
	}
}

export class TransportRequest extends CreepRequest {
	resourceType: ResourceConstant;

	constructor(
		targetId: string,
		resourceType: ResourceConstant
	) {
		super('transport',
			  REQUEST_PRIORITIES.TRANSPORT_REQUEST,
			  targetId,
			  // @ts-ignore: Object is possibly 'null'.
			  Game.getObjectById(targetId).store.getFreeCapacity(resourceType)
		);
		this.resourceType = resourceType;
	}
}

export class RefuelRequest extends Request {
	creepName: string;
	amount: number;

	constructor(creepName: string, amount: number) {
		super('refuel', REQUEST_PRIORITIES.REFUEL_REQUEST, 'n/a');
		this.creepName = creepName;
		this.amount = amount;
	}
}
