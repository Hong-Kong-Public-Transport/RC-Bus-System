import {Component, inject} from "@angular/core";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {MenuItem, PrimeIcons} from "primeng/api";
import {getLanguageMapping, setCookie} from "./utility/utilities";
import {ThemeService} from "./service/theme.service";
import {TabsModule} from "primeng/tabs";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {MenuModule} from "primeng/menu";
import {DisplaysComponent} from "./component/displays/displays.component";

@Component({
	selector: "app-root",
	imports: [
		ButtonModule,
		TooltipModule,
		MenuModule,
		TabsModule,
		TranslocoDirective,
		DisplaysComponent,
	],
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent {
	private readonly themeService = inject(ThemeService);
	private readonly translocoService = inject(TranslocoService);

	readonly languageMenuItems: MenuItem[] = this.translocoService.getAvailableLangs().map(langDefinition => {
		const lang = langDefinition.toString();
		return ({
			id: lang,
			icon: PrimeIcons.CHECK,
			label: getLanguageMapping(lang),
			command: () => {
				this.translocoService.setActiveLang(lang);
				setCookie("language", lang);
			},
		});
	});

	constructor() {
		this.translocoService.events$.subscribe(events => {
			if (events.type === "translationLoadSuccess" || events.type === "langChanged") {
				this.updateMenuItems();
			}
		});

		this.updateMenuItems();
	}

	toggleTheme() {
		this.themeService.setTheme(!this.themeService.darkTheme());
	}

	getThemeIcon() {
		return this.themeService.darkTheme() ? PrimeIcons.SUN : PrimeIcons.MOON;
	}

	getThemeTranslationKey() {
		return this.themeService.darkTheme() ? "menu.lightTheme" : "menu.darkTheme";
	}

	private updateMenuItems() {
		this.languageMenuItems.forEach(menuItem => menuItem.iconStyle = this.translocoService.getActiveLang() === menuItem.id ? {} : {color: "transparent"});
	}
}
