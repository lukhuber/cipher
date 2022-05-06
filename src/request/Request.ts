export class Request {
	type: RequestTypes;
	priority: number;
	role?: Roles;
	target?: ConstructionSite | SinkUnit | StorageUnit;
	
	constructor(type: RequestTypes, priority: number, role?: Roles , target?: ConstructionSite | SinkUnit | StorageUnit) {
		this.type = type;
		this.priority = priority;
		this.role = role
		this.target = target
	}
}
