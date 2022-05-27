import { SpawnRequest, TransportRequest } from '.././request/Request'

Room.prototype.getCreepsByRole = function (role: string): Creep[] {
  return _.filter(
    Game.creeps,
    (creep) => creep.memory.role == role && creep.memory.home == this.name
  );
};

Room.prototype.getSpawnRequests = function (): SpawnRequest[] {
  return _.filter(this.memory.Requests, (r) => r.type === 'spawn');
};

Room.prototype.getTransportRequests = function (): TransportRequest[] {
  return _.filter(this.memory.Requests, (r) => r.type === 'transport');
};
