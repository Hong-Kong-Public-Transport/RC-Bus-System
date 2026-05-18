import {Injectable, signal, WritableSignal} from "@angular/core";
import {getCookie, setCookie} from "../utility/utilities";

@Injectable({providedIn: "root"})
export class ThemeService {
	readonly darkTheme: WritableSignal<boolean>;

	constructor() {
		this.darkTheme = signal(getCookie("dark_theme") === "true");
		this.setElementTag();
	}

	public setTheme(isDarkTheme: boolean) {
		this.darkTheme.set(isDarkTheme);
		this.setElementTag();
	}

	private setElementTag() {
		setCookie("dark_theme", this.darkTheme().toString());

		const element = document.querySelector("html");
		if (element) {
			element.classList.add(this.darkTheme() ? "dark-theme" : "light-theme");
			element.classList.remove(this.darkTheme() ? "light-theme" : "dark-theme");
		}
	}
}
