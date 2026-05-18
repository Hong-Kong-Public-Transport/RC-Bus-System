export interface Data {
	readonly displays: PersistedDisplay[][][];
	readonly settings: PersistedSettings;
}

export interface PersistedDisplay {
	readonly fileName: string;
	readonly source: string;
	readonly size: string;
	readonly index: number;
}

export interface PersistedSettings {
	readonly wifiSSID: string;
	readonly wifiPassword: string;
}
