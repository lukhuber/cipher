import { SpawnRequest, TransportRequest } from ".././request/Request";

Room.prototype.getCreepsByRole = function (role: string): Creep[] {
  return _.filter(
    Game.creeps,
    (creep) => creep.memory.role == role && creep.memory.home == this.name
  );
};

Room.prototype.getCreeps = function (): Creep[] {
  return _.filter(Game.creeps, (creep) => creep.memory.home == this.name);
};

Room.prototype.getSpawnRequests = function (): SpawnRequest[] {
  return _.filter(this.memory.Requests, (r) => r.type === "spawn");
};

Room.prototype.getTransportRequests = function (): TransportRequest[] {
  return _.filter(this.memory.Requests, (r) => r.type === "transport");
};

Room.prototype.getRequests = function (): Request[] {
  return this.memory.Requests;
};

Room.prototype.getBuildingRequests = function (): Request[] {
  return _.filter(this.memory.Requests, (r) => r.type === "spawn");
};

Room.prototype.getCreepRequests = function (): Request[] {
  return _.filter(this.memory.Requests, (r) => r.type != "spawn");
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
  return _.max(this.find(FIND_DROPPED_RESOURCES), "amount").id;
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


  if (storage.length > 0) {
    // If a storage is built, we want to return that
    targetId = storage[0].id;
  } else if (containers.length > 0) {
    // Else we return the container with the most energy in it
    targetId = _.max(containers, function (c) {
      return c.store.getUsedCapacity();
    }).id;
  } else if (droppedEnergy.length > 0) {
    targetId = _.max(droppedEnergy, "amount").id;
  } 
  return targetId;
};

Room.prototype.setFullCreepsToIdle = function (): void {
  const fullCreeps: Creep[] = _.filter(this.getCreepsByRole("worker"), 
                                  function(creep) {
                                    return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0
                                  });

  for (const creep of fullCreeps) {
    creep.memory.isIdle = true;
  }
}