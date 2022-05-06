interface RoomVisual {
	box(x: number, y: number, w: number, h: number, style?: LineStyle): RoomVisual;
}

interface Room {
	getCreepsByRole(role: string): Creep[];
}

type SinkUnit = 
	| StructureSpawn
	| StructureExtension
	| StructureLab
	| StructurePowerSpawn
	| StructureNuker
	| StructureTower;

type StorageUnit = StructureContainer | StructureTerminal | StructureStorage;

type RequestTypes = 'spawn' | 'build' | 'fill' | 'repair';

type Roles = 'harvester' | 'worker' | 'upgrader' | 'transporter' | 'queen';
