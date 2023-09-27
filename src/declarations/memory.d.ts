interface RoomMemory {
	isInitialized: boolean;
	euclideanDistance: number[][];
	Requests: Request[];
	Tasks: Task[];
	upgradeContainer: Id<_HadId>;
	miningContainers: Id<_HadId>[];
	storage: Id<_HadId>;
	containersBuilt: boolean;
	janitorPresent: boolean;
	transporterPresent: boolean;
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
