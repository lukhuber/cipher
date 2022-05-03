RoomVisual.prototype.box = function (x: number, y: number, w: number, h: number, style?: LineStyle): RoomVisual {
	return this.line(x, y, x + w, y, style)
		.line(x + w, y, x + w, y + h, style)
		.line(x + w, y + h, x, y + h, style)
		.line(x, y + h, x, y, style);
};
