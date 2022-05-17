type pos = { x: number; y: number };

export function updateBunkerRCL2(room: Room, anchorPos: RoomPosition): void {
  // Coordinates for buildings in relation to the bunker anchor --------------------------------------------------------
  const extensions: pos[] = [
		{ x: -1, y: -2 },
		{ x: -2, y: -2 },
		{ x: -3, y: -2 },
		{ x: -4, y: -2 },
		{ x: -3, y: -3 },
  ];

  // Place all construction sites. Existing buildings will be automatically skipped ------------------------------------
  for (const e of extensions) {
		room.createConstructionSite(
		  anchorPos.x + e.x,
		  anchorPos.y + e.y,
		  STRUCTURE_EXTENSION
		);
  }
}

export function updateBunkerRCL3(room: Room, anchorPos: RoomPosition): void {
  // Coordinates for buildings in relation to the bunker anchor --------------------------------------------------------
  const tower: pos = { x: 0, y: -1 };
  const extensions: pos[] = [
		{ x: +3, y: -1 },
		{ x: +4, y: -2 },
		{ x: +3, y: -2 },
		{ x: +2, y: -2 },
		{ x: +3, y: -3 },
  ];

  // Place all construction sites. Existing buildings will be automatically skipped ------------------------------------
  for (const e of extensions) {
		room.createConstructionSite(
		  anchorPos.x + e.x,
		  anchorPos.y + e.y,
		  STRUCTURE_EXTENSION
		);
  }
  room.createConstructionSite(
		anchorPos.x + tower.x,
		anchorPos.y + tower.y,
		STRUCTURE_TOWER
  );
}

export function updateBunkerRCL4(room: Room, anchorPos: RoomPosition): void {
  // Coordinates for buildings in relation to the bunker anchor --------------------------------------------------------
  const storage: pos = { x: 0, y: 0 };
  const extensions: pos[] = [
		{ x: -2, y: -3 },
		{ x: -2, y: -4 },
		{ x: -1, y: -3 },
		{ x: +1, y: -3 },
		{ x: +2, y: -4 },
		{ x: +2, y: -3 },
		{ x: +1, y: -5 },
		{ x: -1, y: -5 },
		{ x: 0, y: -4 },
		{ x: 0, y: -5 },
  ];

  // Place all construction sites. Existing buildings will be automatically skipped ------------------------------------
  for (const e of extensions) {
		room.createConstructionSite(
		  anchorPos.x + e.x,
		  anchorPos.y + e.y,
		  STRUCTURE_EXTENSION
		);
  }
  room.createConstructionSite(
		anchorPos.x + storage.x,
		anchorPos.y + storage.y,
		STRUCTURE_STORAGE
  );
}

export function updateBunkerRCL5(room: Room, anchorPos: RoomPosition): void {
  // Coordinates for buildings in relation to the bunker anchor --------------------------------------------------------
  const tower: pos = { x: 0, y: +1 };
  const extensions: pos[] = [
		{ x: -4, y: 0 },
		{ x: -5, y: 0 },
		{ x: -5, y: +1 },
		{ x: -5, y: -1 },
		{ x: -5, y: -3 },
		{ x: -5, y: -4 },
		{ x: -5, y: -5 },
		{ x: -4, y: -4 },
		{ x: -4, y: -5 },
		{ x: -3, y: -5 },
  ];

  // Place all construction sites. Existing buildings will be automatically skipped ------------------------------------
  for (let e of extensions) {
		room.createConstructionSite(
		  anchorPos.x + e.x,
		  anchorPos.y + e.y,
		  STRUCTURE_EXTENSION
		);
  }
  room.createConstructionSite(
		anchorPos.x + tower.x,
		anchorPos.y + tower.y,
		STRUCTURE_TOWER
  );
}

export function updateBunkerRCL6(room: Room, anchorPos: RoomPosition): void {
  // Coordinates for buildings in relation to the bunker anchor --------------------------------------------------------
  const extensions: pos[] = [
		{ x: +4, y: 0 },
		{ x: +5, y: 0 },
		{ x: +5, y: +1 },
		{ x: +5, y: -1 },
		{ x: +5, y: -3 },
		{ x: +5, y: -4 },
		{ x: +5, y: -5 },
		{ x: +4, y: -4 },
		{ x: +4, y: -5 },
		{ x: +3, y: -5 },
  ];

  // Place all construction sites. Existing buildings will be automatically skipped ------------------------------------
  for (const e of extensions) {
		room.createConstructionSite(
		  anchorPos.x + e.x,
		  anchorPos.y + e.y,
		  STRUCTURE_EXTENSION
		);
  }
}

export function updateBunkerRCL7(room: Room, anchorPos: RoomPosition): void {
  // Coordinates for buildings in relation to the bunker anchor --------------------------------------------------------
  const tower: pos = { x: -1, y: 0 };
  const extensions: pos[] = [
		{ x: -5, y: +3 },
		{ x: -5, y: +4 },
		{ x: -4, y: +4 },
		{ x: -5, y: +5 },
		{ x: -4, y: +5 },
		{ x: -3, y: +5 },
		{ x: -6, y: +2 },
		{ x: -6, y: -2 },
		{ x: -6, y: -6 },
		{ x: +2, y: -6 },
  ];

  // Place all construction sites. Existing buildings will be automatically skipped ------------------------------------
  for (const e of extensions) {
		room.createConstructionSite(
		  anchorPos.x + e.x,
		  anchorPos.y + e.y,
		  STRUCTURE_EXTENSION
		);
  }
  room.createConstructionSite(
		anchorPos.x + tower.x,
		anchorPos.y + tower.y,
		STRUCTURE_TOWER
  );
}

export function updateBunkerRCL8(room: Room, anchorPos: RoomPosition): void {
  // Coordinates for buildings in relation to the bunker anchor --------------------------------------------------------
  const towers: pos[] = [
		{ x: +1, y: 0 },
		{ x: -1, y: -1 },
		{ x: +1, y: +1 },
  ];
  const extensions: pos[] = [
		{ x: +5, y: +3 },
		{ x: +5, y: +4 },
		{ x: +4, y: +4 },
		{ x: +5, y: +5 },
		{ x: +4, y: +5 },
		{ x: +3, y: +5 },
		{ x: +6, y: +2 },
		{ x: +6, y: -2 },
		{ x: -2, y: +6 },
		{ x: +2, y: +6 },
  ];

  // Place all construction sites. Existing buildings will be automatically skipped ------------------------------------
  for (const e of extensions) {
		room.createConstructionSite(
		  anchorPos.x + e.x,
		  anchorPos.y + e.y,
		  STRUCTURE_EXTENSION
		);
  }
  for (const t of towers) {
		room.createConstructionSite(
		  anchorPos.x + t.x,
		  anchorPos.y + t.y,
		  STRUCTURE_TOWER
		);
  }
}
