import { SpawnRequest, TransportRequest } from '.././request/Request';

Room.prototype.getCreepsByRole = function (role: string): Creep[] {
  return _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.home == this.name);
};

Room.prototype.getSpawnRequests = function (): SpawnRequest[] {
  return _.filter(this.memory.Requests, (r) => r.type === 'spawn');
};

Room.prototype.getTransportRequests = function (): TransportRequest[] {
  return _.filter(this.memory.Requests, (r) => r.type === 'transport');
};

Room.prototype.getRefuelStation = function(): Structure | undefined {
  const storage: Structure[] = this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_STORAGE }});
  const containers: StructureContainer[] = this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_CONTAINER }}) as unknown as StructureContainer[];

  if (storage.length > 0) {                            // If a storage is built, we want to return that
    return storage[0];
  } else if (containers.length > 0) {                  // Else we return the container with the most energy in it
    return _.max(containers, function(c) { return c.store.getUsedCapacity(); });
  } else {                                             // In case neither is present (yet)
    return undefined;
  }
}