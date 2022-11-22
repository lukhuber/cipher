interface RoomVisual {
	box(x: number, y: number, w: number, h: number, style?: LineStyle): RoomVisual;
}

interface Room {
	getCreepsByRole(role: string): Creep[];
	getSpawnRequests(): SpawnRequest[];
	getTransportRequests(): TransportRequest[];
	getRefuelStation(): Structure | undefined;
}

interface Creep {
	harvestSource(): void;
	fillSpawn(spawn: StructureSpawn): void;
	getEnergy(target: StructureStorage | StructureContainer | Resource): void;
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
	| SpawnRequest
	| TransportRequest
	| RefuelRequest;

type Roles = 
	| 'harvester' 
	| 'worker' 
	| 'upgrader' 
	| 'transporter' 
	| 'queen';
