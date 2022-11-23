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

export function runUpgrade(task: Task): void {
	if (task.type != 'upgrade') {
		throw new Error ('Wrong type of Task provided to runUpgrade()');
	}

	const creep: Creep = Game.creeps[task.creepName];
	const home: string = creep.memory.home;
	const controller: StructureController | undefined = Game.rooms[home].controller

	if (controller === undefined) {
		throw new Error ('Could not find controller in home ' + home + 'of creep ' + creep.name);
	}

	if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
		task.status = 'outbound'
        creep.moveTo(controller);
    } else {
    	task.status = 'upgrading'
    }

    // Set creep to idle and delete task from list when creep is empty ------------------------------------------------
    if (creep.store.getUsedCapacity() === 0) {
		creep.memory.isIdle = true
		const index: number = Game.creeps[task.creepName].room.memory.Tasks.indexOf(task);
		Game.creeps[task.creepName].room.memory.Tasks.splice(index, 1);
	}
}