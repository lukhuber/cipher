export function triageRequest(request: Request): void {
    switch (request.type) {
        case 'upgrade':
            doUpgradeRequest(request);
            break;
        case 'transport':
            doTransportRequest(request);
            break;
        case 'build':
            doBuildRequest(request);
            break;
    }
}

function doUpgradeRequest(request: Request): void {
    const assignedCreeps: [string, number][] = request.assignedCreeps;

    for (const creepPair of assignedCreeps) {       // 'creep' contains it's name and the amount of energy!
        const creep: Creep = Game.creeps[creepPair[0]];
        const energy: number = creepPair[1];

        // If the creep dies during this request, update request accordingly ------------------------------------------
        if (creep === undefined) {
            request.outboundEnergy -= energy;
            removeCreepFromRequest(creepPair, request);
            return;
        }

        const home: string = creep.memory.home;
        const controller: StructureController | undefined = Game.rooms[home].controller

        if (controller === undefined) {
        	throw new Error ('Could not find controller in home ' + home + 'of creep ' + creep.name);
        }

        if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller);
        }

        // Set creep to idle when creep is empty and remove him from the list of assigned Creeps ----------------------
        if (creep.store.getUsedCapacity() === 0) {
        	creep.memory.isIdle = true
        	const index: number = request.assignedCreeps.indexOf(creepPair);
        	request.assignedCreeps.splice(index, 1);
            request.outboundEnergy -= energy;
        }
    }
}

function doTransportRequest(request: Request): void {
    const assignedCreeps: [string, number][] = request.assignedCreeps;

    for (const creepPair of assignedCreeps) {       // 'creep' contains it's name and the amount of energy!
        const creep: Creep = Game.creeps[creepPair[0]];
        const energy: number = creepPair[1];

        // If the creep dies during this request, update request accordingly ------------------------------------------
        if (creep === undefined) {
            request.outboundEnergy -= energy;
            removeCreepFromRequest(creepPair, request);
            return;
        }

        const target: Structure = Game.getObjectById(request.targetId) as Structure;
        const resourceType: ResourceConstant = request.resourceType

        if (target === undefined) {
        	throw new Error ('Could not find target of TransportRequest in ' + creep.memory.home + 'of creep ' + creep.name);
        }

        if(creep.transfer(target, resourceType) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

        // Set creep to idle when creep is empty and remove him from the list of assigned Creeps ----------------------
        if (creep.store.getUsedCapacity() === 0) {
        	creep.memory.isIdle = true
        	const index: number = request.assignedCreeps.indexOf(creepPair);
        	request.assignedCreeps.splice(index, 1);
            request.outboundEnergy -= energy;
        }
    }
}

function doBuildRequest(request: Request): void {
    const assignedCreeps: [string, number][] = request.assignedCreeps;

    for (const creepPair of assignedCreeps) {       // 'creep' contains it's name and the amount of energy!
        const creep: Creep = Game.creeps[creepPair[0]];
        const energy: number = creepPair[1];

        // If the creep dies during this request, update request accordingly ------------------------------------------
        if (creep === undefined) {
            request.outboundEnergy -= energy;
            removeCreepFromRequest(creepPair, request);
            return;
        }

        const target: ConstructionSite = Game.getObjectById(request.targetId) as ConstructionSite;

        if (target === undefined) {
        	throw new Error ('Could not find target of BuildRequest in ' + creep.memory.home + 'of creep ' + creep.name);
        }

        if(creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

        // Set creep to idle when creep is empty and remove him from the list of assigned Creeps ----------------------
        if (creep.store.getUsedCapacity() === 0) {
        	creep.memory.isIdle = true
        	const index: number = request.assignedCreeps.indexOf(creepPair);
        	request.assignedCreeps.splice(index, 1);
        }
    }
}

function removeCreepFromRequest(creepPair: [string, number], request: Request): void {
    const index: number = request.assignedCreeps.indexOf(creepPair);
    request.assignedCreeps.splice(index, 1);
}
