import { REQUEST_PRIORITIES } from '.././settings'

export class Request {
    type: string
    priority: number
    targetId: string

    constructor(type: string, priority: number, targetId: string) {
        this.type = type
        this.priority = priority
        this.targetId = targetId
    }
}

export class CreepRequest extends Request {
    assignedCreeps: [string, number][]
    neededEnergy: number
    outboundEnergy: number

    constructor(type: string, priority: number, targetId: string, neededEnergy: number) {
        super(type, priority, targetId)
        this.assignedCreeps = []
        this.outboundEnergy = 0
        this.neededEnergy = neededEnergy
    }

    run(): void {
        console.log('Requests with type ' + this.type + ' have no behavior programmed in run()!')
    }
}

export class SpawnRequest extends Request {
    role: Roles

    constructor(priority: number, role: Roles) {
        super('spawn', priority, 'n/a')
        this.role = role
    }
}

export class UpgradeRequest extends CreepRequest {
    constructor(controllerId: string) {
        super('upgrade', REQUEST_PRIORITIES.UPGRADE_REQUEST, controllerId, -1)
    }
}

export class TransportRequest extends CreepRequest {
    resourceType: ResourceConstant
    transportPriority: number

    constructor(targetId: string, transportPriority: number, resourceType: ResourceConstant) {
        super(
            'transport',
            REQUEST_PRIORITIES.TRANSPORT_REQUEST,
            targetId,
            // @ts-ignore: Object is possibly 'null'.
            Game.getObjectById(targetId).store.getFreeCapacity(resourceType)
        )
        this.transportPriority = transportPriority
        this.resourceType = resourceType
    }
}

export class BuildRequest extends CreepRequest {
    buildPriority: Number

    constructor(targetId: string, buildPriority: number) {
        super(
            'build',
            REQUEST_PRIORITIES.BUILD_REQUEST,
            targetId,
            // @ts-ignore: Object is possibly 'null'.
            Game.getObjectById(targetId).progressTotal - Game.getObjectById(targetId).progress
        )
        this.buildPriority = buildPriority      // Used to order only build request within themselves
    }
}
