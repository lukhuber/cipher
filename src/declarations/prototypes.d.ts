interface RoomVisual {
	box(x: number, y: number, w: number, h: number, style?: LineStyle): RoomVisual;
}

interface Room {
	getCreepsByRole(role: string): Creep[];
	getCreeps(): Creep[];
	getSpawnRequests(): SpawnRequest[];
	getTransportRequests(): TransportRequest[];
	getRequests(): Request[];
	getBuildingRequests(): Request[];
	getCreepRequests(): Request[];
	getRequestsByType(type: string): Request[];
	getTasks(): Task[];
	getTasksByType(type: string): Task[];
	getNumberOfTasksByType(type: string): number;
	getRefuelStation(): Id<_HasId> | undefined;
	getDroppedEnergy(): Id<_HasId> | undefinded;
	getRefuelTargetId(): ID<_HadId> | undefined;
	setFullCreepsToIdle(): void;
}

interface Creep {
	harvestSource(): void;
	fillSpawn(spawn: StructureSpawn): void;
	getEnergy(target: Structure | Resource): void;
}

type SinkUnit =
	| StructureSpawn
	| StructureExtension
	| StructureLab
	| StructurePowerSpawn
	| StructureNuker
	| StructureTower;

type StorageUnit =
	| StructureContainer
	| StructureTerminal
	| StructureStorage;

type Request =
	| UpgradeRequest
	| SpawnRequest
	| TransportRequest
	| RefuelRequest;

type Task =
	| RefuelTask
	| UpgradeTask;

type Roles =
	| 'harvester'
	| 'worker'
	| 'upgrader'
	| 'transporter'
	| 'janitor';
