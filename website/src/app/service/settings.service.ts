import {Injectable} from "@angular/core";
import {PersistedServiceBase} from "./persisted.service.base";
import {PersistedSettings} from "../entity/data";

@Injectable({providedIn: "root"})
export class SettingsService extends PersistedServiceBase<PersistedSettings> {

	override read(data: PersistedSettings) {
		console.log(data); // TODO
	}

	override write(): PersistedSettings {
		return {wifiSSID: "", wifiPassword: ""}; // TODO
	}
}
