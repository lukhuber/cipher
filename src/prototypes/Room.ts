import { SpawnRequest, TransportRequest } from '.././request/Request';
import { SPAWN_PRIORITIES, INITIAL_SPAWN_PRIORITIES, ENERGY_ON_GROUND_THRESHOLD } from '.././settings';

Room.prototype.getCreepsByRole = function (role: string): Creep[] {
    return _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.home == this.name);
};

Room.prototype.getCreeps = function (): Creep[] {
    return _.filter(Game.creeps, (creep) => creep.memory.home == this.name);
};

Room.prototype.getSpawnRequests = function (): SpawnRequest[] {
    return _.filter(this.memory.Requests, (r) => r.type === 'spawn');
};

Room.prototype.getTransportRequests = function (): TransportRequest[] {
    return _.filter(this.memory.Requests, (r) => r.type === 'transport');
};

Room.prototype.getRequests = function (): Request[] {
    return this.memory.Requests;
};

Room.prototype.getBuildingRequests = function (): Request[] {
    return _.filter(this.memory.Requests, (r) => r.type === 'spawn');
};

Room.prototype.getCreepRequests = function (): Request[] {
    return _.filter(this.memory.Requests, (r) => r.type != 'spawn');
};

Room.prototype.getRequestsByType = function (type: string): Request[] {
    return _.filter(this.memory.Requests, (r) => r.type === type);
};

Room.prototype.getTasks = function (): Task[] {
    return this.memory.Tasks;
};

Room.prototype.getTasksByType = function (type: string): Task[] {
    return _.filter(this.memory.Tasks, (r) => r.type === type);
};

Room.prototype.getNumberOfTasksByType = function (type: string): number {
    return _.filter(this.memory.Tasks, (r) => r.type === type).length;
};

Room.prototype.getRefuelStation = function (): Id<_HasId> | undefined {
    const storage: StructureStorage[] = this.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_STORAGE },
    }) as unknown as StructureStorage[];
    const containers: StructureContainer[] = this.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_CONTAINER },
    }) as unknown as StructureContainer[];

    if (storage.length > 0) {
        // If a storage is built, we want to return that
        return storage[0].id;
    } else if (containers.length > 0) {
        // Else we return the container with the most energy in it
        return _.max(containers, function (c) {
            return c.store.getUsedCapacity();
        }).id;
    } else {
        // In case neither is present (yet)
        return undefined;
    }
};

Room.prototype.getDroppedEnergy = function (): Id<_HasId> | undefined {
    return _.max(this.find(FIND_DROPPED_RESOURCES), 'amount').id;
};

Room.prototype.getRefuelTargetId = function (): Id<_HasId> | undefined {
    let targetId: Id<_HasId> | undefined = undefined;

    const storage: StructureStorage[] = this.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_STORAGE },
    }) as unknown as StructureStorage[];
    const containers: StructureContainer[] = this.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_CONTAINER },
    }) as unknown as StructureContainer[];
    const droppedEnergy: Resource[] = this.find(FIND_DROPPED_RESOURCES);

    // QUICK AND DIRTY
    let containerEnergy: number = 0;
    if (containers.length > 0) {
        containerEnergy = _.max(containers, function (c) {
            return c.store.getUsedCapacity();
        }).store.getUsedCapacity(RESOURCE_ENERGY);
    }
    let storageEnergy: number = 0;
    if (storage.length > 0) {
        storageEnergy = _.max(storage, function (c) {
            return c.store.getUsedCapacity();
        }).store.getUsedCapacity(RESOURCE_ENERGY);
    }
    let droppedEnergyAmount: number = 0;
    if (droppedEnergy.length > 0) {
        droppedEnergyAmount = _.max(droppedEnergy, 'amount').amount;
    }
    // QUICK AND DIRTY END

    if (storage.length > 0 && storageEnergy > 0) {
        // If a storage is built, we want to return that
        targetId = storage[0].id;
    } else if (containers.length > 0 && containerEnergy > 0 && containerEnergy > droppedEnergyAmount) {
        // Else we return the container with the most energy in it
        targetId = _.max(containers, function (c) {
            return c.store.getUsedCapacity();
        }).id;
    } else if (droppedEnergy.length > 0) {
        targetId = _.max(droppedEnergy, 'amount').id;
    }

    return targetId;
};

Room.prototype.setFullCreepsToIdle = function (): void {
    const fullCreeps: Creep[] = _.filter(this.getCreepsByRole('worker'), function (creep) {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
    });

    for (const creep of fullCreeps) {
        creep.memory.isIdle = true;
    }
};

Room.prototype.createSpawnRequest = function (role: Roles): void {
    // Get spawn requests for the specified role. We don't want to create another one ---------------------------------
    const requests: number = this.getSpawnRequests().filter((r) => r.role === role).length;

    // Get spawns spawning the specified role. We don't want to create a request, if this role is spawning ------------
    const spawns: StructureSpawn[] = this.find(FIND_MY_SPAWNS);
    let roleSpawning: boolean = false;

    for (const s of spawns) {
        const spawn: StructureSpawn = Game.spawns[s.name];
        if (spawn.spawning && spawn.spawning.name.includes(role)) {
            roleSpawning = true;
        }
    }

    // Get spawn request priority depending on the role ---------------------------------------------------------------
    let priority: number = 0;
    switch (role) {
        case 'harvester': {
            if (this.getCreepsByRole(role).length === 0) {
                priority = INITIAL_SPAWN_PRIORITIES.HARVESTER;
            } else {
                priority = SPAWN_PRIORITIES.HARVESTER;
            }
            break;
        }
        case 'worker': {
            if (this.getCreepsByRole(role).length === 0) {
                priority = INITIAL_SPAWN_PRIORITIES.WORKER;
            } else {
                priority = SPAWN_PRIORITIES.WORKER;
            }
            break;
        }
        case 'transporter': {
            if (this.getCreepsByRole(role).length === 0) {
                priority = INITIAL_SPAWN_PRIORITIES.TRANSPORTER;
            } else {
                priority = SPAWN_PRIORITIES.TRANSPORTER;
            }
            break;
        }
        case 'janitor': {
            if (this.getCreepsByRole(role).length === 0) {
                priority = INITIAL_SPAWN_PRIORITIES.JANITOR;
            } else {
                priority = SPAWN_PRIORITIES.JANITOR;
            }
            break;
        }
        case 'upgrader': {
            if (this.getCreepsByRole(role).length === 0) {
                priority = INITIAL_SPAWN_PRIORITIES.UPGRADER;
            } else {
                priority = SPAWN_PRIORITIES.UPGRADER;
            }
            break;
        }

        default: {
            priority = 0;
            break;
        }
    }

    // Create request, if no creep with specified role is spawning and no request is pending --------------------------
    if (requests === 0 && !roleSpawning) {
        const spawnRequest: SpawnRequest = new SpawnRequest(priority, role);
        this.memory.Requests.push(spawnRequest);
    }
};

Room.prototype.isHarvesterNeeded = function (): boolean {
    return this.find(FIND_SOURCES).length > this.getCreepsByRole('harvester').length;
};

Room.prototype.isUpgraderNeeded = function (): boolean {
    return this.getCreepsByRole('upgrader').length === 0;
};

Room.prototype.isWorkerNeeded = function (): boolean {
    // Always have 2 workers present!
    if (this.getCreepsByRole('worker').length < 2) {
        return true;
    }

    // If too much energy is on the floor, we need more workers
    if (
        !this.memory.containersBuilt &&
        _.sum(_.map(this.find(FIND_DROPPED_RESOURCES), (energy) => energy.amount)) > ENERGY_ON_GROUND_THRESHOLD
    ) {
        return true;
    }

    // This only applies the short time, when containers at mining sites are built, but others aren't
    if (!this.memory.containersBuilt) {
        const containers: StructureContainer[] = this.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_CONTAINER },
        }) as unknown as StructureContainer[];
        let containerCapacity: number = 0;
        let energyInContainers: number = 0;

        if (containers.length != 0) {
            for (const container of containers) {
                containerCapacity += container.store.getCapacity();
                energyInContainers += container.store[RESOURCE_ENERGY];
            }
        }

        if (energyInContainers > containerCapacity / 1.5) {
            return true;
        }
    }

    // His part applies, when all containers are built
    if (this.memory.containersBuilt) {
        let upgradeContainerLevel: number = Game.getObjectById(this.memory.upgradeContainer).store.getUsedCapacity(
            RESOURCE_ENERGY
        );
        let storageLevel: number = Game.getObjectById(this.memory.storage).store.getUsedCapacity(RESOURCE_ENERGY);
        if (storageLevel >= 1500 && upgradeContainerLevel === 2000) {
            return true;
        }
    }

    return false;
};

Room.prototype.isTransporterNeeded = function (): boolean {
    // No transporters needed, prior controller level 2
    if (this.controller === undefined || this.controller.level < 2) {
        return false;
    }

    const transporterCount: number = this.getCreepsByRole('transporter').length;

    let energyInMiningContainers: number = 0;

    if (this.memory.miningContainers) {
        for (const c of this.memory.miningContainers) {
            energyInMiningContainers += Game.getObjectById(c).store.getUsedCapacity(RESOURCE_ENERGY);
        }
    }

    // We make also sure, that all containers are finished building
    if (this.memory.containersBuilt && (transporterCount < 2 || energyInMiningContainers > 3500)) {
        return true;
    } else {
        return false;
    }
};

Room.prototype.isJanitorNeeded = function (): boolean {
    const janitor: Creep[] = this.getCreepsByRole('janitor');

    if (janitor.length === 0 && this.memory.containersBuilt) {
        return true;
    } else if (janitor.length === 1 && (janitor[0].ticksToLive as number) < 100) {
        return true;
    } else {
        return false;
    }
};