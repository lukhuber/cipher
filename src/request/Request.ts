export class Request {
	type: RequestTypes;
	role: Roles;
	target: ConstructionSite | SinkUnit | StorageUnit | undefined;
	priority: number;

	constructor(type: RequestTypes, priority: number, role: Roles  = undefined, target: ConstructionSite | SinkUnit | StorageUnit | undefined = undefined) {
		this.type = type;
		this.priority = priority;
		this.role = role
		this.target = target
	}
}
