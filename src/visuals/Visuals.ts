const ANCHOR: { x: number; y: number } = { x: 1, y: 1 };
const OPACITY_TEXT: number = 0.5;
const OPACITY_BOXES: number = 0.2;
const OPACITY_BARS: number = 0.2;
const FONTSIZE: number = 0.7;
const PANEL_WIDTH: number = 7;

export class Visuals {
	static displayStatistics(room: Room): void {
		Visuals.bars(room);
		Visuals.creepsStats(room);
	}

	static displayEuclidDist(room: Room): void {
		const euclideanDistance = room.memory.euclideanDistance;

		for (let x = 0; x < 50; x++) {
			for (let y = 0; y < 50; y++) {
				if (euclideanDistance[x][y] == 0) {
					continue;
				}
				const green: number = euclideanDistance[x][y] * 17;
				const white: number = parseInt('ff', 16);
				const color: string =
					'#' + (white - green).toString(16).padStart(2, '0') + 'ff' + (white - green).toString(16).padStart(2, '0');
				new RoomVisual(room.name).text(String(euclideanDistance[x][y]), x, y + 0.25, { color: color });
			}
		}
	}

	private static bars(room: Room): void {
		// Define where the bars should be ---------------------------------------------------------------------------------
		const cpuPos: { x: number; y: number } = { x: ANCHOR.x, y: ANCHOR.y + 0 };
		const bktPos: { x: number; y: number } = { x: ANCHOR.x, y: ANCHOR.y + 1 };
		const gclPos: { x: number; y: number } = { x: ANCHOR.x, y: ANCHOR.y + 2 };

		// Get the bar lengths ---------------------------------------------------------------------------------------------
		const cpuBar: number = (Game.cpu.getUsed() / Game.cpu.limit) * (PANEL_WIDTH - 2);
		const bktBar: number = (Game.cpu.bucket / 10000) * (PANEL_WIDTH - 2);
		const gclBar: number = (Game.gcl.progress / Game.gcl.progressTotal) * (PANEL_WIDTH - 2);

		// Get the percentages for each bar --------------------------------------------------------------------------------
		const cpuPer: string = String(Math.floor((Game.cpu.getUsed() / Game.cpu.limit) * 100 + 0.5)) + '%';
		const bktPer: string = String(Math.floor((Game.cpu.bucket / 10000) * 100 + 0.5)) + '%';
		const gclPer: string = String(Math.floor((Game.gcl.progress / Game.gcl.progressTotal) * 100 + 0.5)) + '%';

		// Draw the labels for the bars ------------------------------------------------------------------------------------
		const labels: RoomVisual = new RoomVisual(room.name);
		labels.text('CPU', cpuPos.x, cpuPos.y, { opacity: OPACITY_TEXT, font: FONTSIZE, align: 'left' });
		labels.text('BKT', bktPos.x, bktPos.y, { opacity: OPACITY_TEXT, font: FONTSIZE, align: 'left' });
		labels.text('GCL', gclPos.x, gclPos.y, { opacity: OPACITY_TEXT, font: FONTSIZE, align: 'left' });

		// Draw the surrounding boxes of the bars --------------------------------------------------------------------------
		const boxes: RoomVisual = new RoomVisual(room.name);
		boxes.box(cpuPos.x + 2, cpuPos.y - 0.65, PANEL_WIDTH - 2, 0.8, { opacity: OPACITY_BOXES });
		boxes.box(bktPos.x + 2, bktPos.y - 0.65, PANEL_WIDTH - 2, 0.8, { opacity: OPACITY_BOXES });
		boxes.box(gclPos.x + 2, gclPos.y - 0.65, PANEL_WIDTH - 2, 0.8, { opacity: OPACITY_BOXES });

		// Draw the bars themselves ----------------------------------------------------------------------------------------
		const bars: RoomVisual = new RoomVisual(room.name);
		bars.rect(cpuPos.x + 2, cpuPos.y - 0.65, cpuBar, 0.8, { opacity: OPACITY_BARS });
		bars.rect(bktPos.x + 2, bktPos.y - 0.65, bktBar, 0.8, { opacity: OPACITY_BARS });
		bars.rect(gclPos.x + 2, gclPos.y - 0.65, gclBar, 0.8, { opacity: OPACITY_BARS });

		// Lastly, fill each bar with percentage info ----------------------------------------------------------------------
		const percentages: RoomVisual = new RoomVisual(room.name);
		percentages.text(cpuPer, cpuPos.x + PANEL_WIDTH / 2 + 1, cpuPos.y, { opacity: OPACITY_TEXT, font: FONTSIZE });
		percentages.text(bktPer, bktPos.x + PANEL_WIDTH / 2 + 1, bktPos.y, { opacity: OPACITY_TEXT, font: FONTSIZE });
		percentages.text(gclPer, gclPos.x + PANEL_WIDTH / 2 + 1, gclPos.y, { opacity: OPACITY_TEXT, font: FONTSIZE });
	}

	private static creepsStats(room: Room): void {
		// Define the anchor of this box -----------------------------------------------------------------------------------
		const pos: { x: number; y: number } = { x: ANCHOR.x, y: ANCHOR.y + 2.5 };
		const styleHeading: { opacity: number; font: number; align: 'center' | 'left' | 'right' | undefined } = {
			opacity: OPACITY_TEXT,
			font: FONTSIZE,
			align: 'left',
		};
		const styleText: { opacity: number; font: number; align: 'center' | 'left' | 'right' | undefined } = {
			opacity: OPACITY_TEXT,
			font: FONTSIZE - 0.1,
			align: 'left',
		};

		// Draw the box for the creeps stats -------------------------------------------------------------------------------
		const creepsStats: RoomVisual = new RoomVisual(room.name);
		creepsStats.box(pos.x, pos.y, PANEL_WIDTH, 6.2, { opacity: OPACITY_BOXES });
		creepsStats.rect(pos.x, pos.y, PANEL_WIDTH, 1, { opacity: 0.1 });

		// Fill the box with labels (aka. text) ----------------------------------------------------------------------------
		creepsStats.text(room.name + ' Creeps', pos.x + 0.2, pos.y + 0.75, styleHeading);
		creepsStats.text('Queen', pos.x + 0.2, pos.y + 1.75, styleText);
		creepsStats.text('Harvester', pos.x + 0.2, pos.y + 2.75, styleText);
		creepsStats.text('Upgrader', pos.x + 0.2, pos.y + 3.75, styleText);
		creepsStats.text('Worker', pos.x + 0.2, pos.y + 4.75, styleText);
		creepsStats.text('Transporter', pos.x + 0.2, pos.y + 5.75, styleText);
	}
}
