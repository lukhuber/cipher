export class RefuelTask {
	type: string;
	creepName: string;
	target: string;
	targetType: 'structure' | 'energy' | undefined;
	status: 'pending' | 'outbound' | 'finished';

	constructor(creepName: string) {
		this.type = 'refuel';
		this.creepName = creepName;
		this.targetType = undefined;
		this.target = this.getTarget();
		this.status = 'pending';
	}

	private getTarget(): string {
		const room: Room = Game.creeps[this.creepName].room;
		const refuelStation: string | undefined = room.getRefuelStation();
		const droppedEnergy: string | undefined = room.getDroppedEnergy();

		Game.creeps[this.creepName].memory.isIdle = false;

		if (refuelStation) {
			this.targetType = 'structure';
			return refuelStation;
		} else if (droppedEnergy) {
			this.targetType = 'energy';
			return droppedEnergy;
		} else {
			Game.creeps[this.creepName].memory.isIdle = true;
			throw new Error ('Could not find target for RefuelTask of ' + this.creepName);
		}
	}
}