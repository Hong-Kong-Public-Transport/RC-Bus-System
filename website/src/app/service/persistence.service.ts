import {inject, Injectable} from "@angular/core";
import {DisplaysService} from "./displays.service";
import {SettingsService} from "./settings.service";
import {getCookie, safeParse, setCookie} from "../utility/utilities";
import {Data} from "../entity/data";

@Injectable({providedIn: "root"})
export class PersistenceService {
	private readonly displaysService = inject(DisplaysService);
	private readonly settingsService = inject(SettingsService);

	constructor() {
		const data = safeParse<Data>(getCookie("data"), {
			displays: [],
			settings: {
				wifiSSID: "",
				wifiPassword: "",
			},
		});
		this.displaysService.read(data.displays);
		this.settingsService.read(data.settings);
	}

	save() {
		setCookie("data", JSON.stringify({
			displays: this.displaysService.write(),
			settings: this.settingsService.write(),
		}));
	}
}
