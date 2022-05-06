declare var global: any;

declare namespace NodeJS {
	interface Global {
		clearAllRequests: void;
		report: void;
	}
}