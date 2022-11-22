Creep.prototype.harvestSource = function (): void {
	// Make sure that mining site is assigned to creep ------------------------------------------------------------------
	if (this.memory.assignedMiningSite === undefined) {
		throw new Error('Harvester has no mining site assigned!');
	}

	// Save source in creep memory, which is right besides its assigned mining site --------------------------------------
	const flag: Flag = Game.flags[this.memory.assignedMiningSite];
	if (!this.memory.source) {
		this.memory.source = flag.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
	}

	// Let the creep harvest its save source -----------------------------------------------------------------------------
	// @ts-ignore: Object is possibly 'null'.
	const source = Game.getObjectById(this.memory.source.id);

	if (source && this.harvest(source) === ERR_NOT_IN_RANGE) {
		this.moveTo(flag, { visualizePathStyle: {} });
	}
};

Creep.prototype.fillSpawn = function (spawn: StructureSpawn): void {
	if (this.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
		this.moveTo(spawn, { visualizePathStyle: {} });
	}
};

Creep.prototype.getEnergy = function(target: StructureStorage | StructureContainer | Resource): void {
	
}

