export class SpawnRequest {
	type: string;
	priority: number;
	role: Roles;

	constructor(priority: number, role: Roles) {
		this.type = 'spawn';
		this.priority = priority;
		this.role = role;
	}
}

export class TransportRequest {
	type: string;
	priority: number;
	target: ConstructionSite | SinkUnit | StorageUnit;
	resourceType: ResourceConstant;

	constructor(
		priority: number,
		target: ConstructionSite | SinkUnit | StorageUnit,
		resourceType: ResourceConstant
	) {
		this.type = 'transport';
		this.priority = priority;
		this.target = target;
		this.resourceType = resourceType;
	}
}
