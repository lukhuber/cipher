Room.prototype.getCreepsByRole = function (role: string): Creep[] {
	return _.filter(
    Game.creeps,
    creep => creep.memory.role == role && creep.memory.home == this.name
  )
}