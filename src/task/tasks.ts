export function runRefuel(task: Task): void {
	if (task.type != 'refuel') {
		throw new Error ('Wrong type of Task provided to runRefuel()');
	}

	const creep: Creep = Game.creeps[task.creepName];

	// Run this Task depending on the type of target ------------------------------------------------------------------
	if (task.targetType === 'structure') {
		const target = Game.getObjectById(task.target) as Structure
		if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    		task.status = 'outbound';
    		creep.moveTo(target);
		}
	} else if (task.targetType === 'energy') {
		const target = Game.getObjectById(task.target) as Resource
		if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
			task.status = 'outbound';
			console.log("here");
        	creep.moveTo(target);
    	}
	}

	// Set creep to idle and delete task from list when finished ------------------------------------------------------
	if (creep.store.getFreeCapacity() === 0) {
		creep.memory.isIdle = true
		const index: number = Game.creeps[task.creepName].room.memory.Tasks.indexOf(task);
		Game.creeps[task.creepName].room.memory.Tasks.splice(index, 1);
	}
}