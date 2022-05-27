interface RoomVisual {
	box(x: number, y: number, w: number, h: number, style?: LineStyle): RoomVisual;
}

interface Room {
	getCreepsByRole(role: string): Creep[];
	getSpawnRequests(): SpawnRequest[];
	getTransportRequests(): TransportRequest[];
}

interface Creep {
	harvestSource(): void;
	fillSpawn(spawn: StructureSpawn): void;
}

type SinkUnit = 
	| StructureSpawn
	| StructureExtension
	| StructureLab
	| StructurePowerSpawn
	| StructureNuker
	| StructureTower;

type StorageUnit = StructureContainer | StructureTerminal | StructureStorage;

type Request = SpawnRequest | TransportRequest;

type Roles = 'harvester' | 'worker' | 'upgrader' | 'transporter' | 'queen';
