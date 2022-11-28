interface RoomMemory {
	isInitialized: boolean;
	euclideanDistance: number[][]:
	Requests: Request[]
	Tasks: Task[]
}

interface FlagMemory {
	assignedHarvester: Creep | undefined;
	assignedUpgrader: Creep | undefined;
}

interface CreepMemory {
	role: string;
	home: string;
	isIdle: boolean;
	assignedMiningSite?: string;
	assignedUpgradeSite?: string;
	source?: Source | null;
	refuelTargetId?: Id<_HadId>;
}
