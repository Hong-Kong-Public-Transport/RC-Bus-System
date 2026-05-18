import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {provideHttpClient} from "@angular/common/http";
import {isDevMode} from "@angular/core";
import {providePrimeNG} from "primeng/config";
import {myPreset} from "./theme-preset";
import {provideTransloco} from "@jsverse/transloco";
import {TranslocoHttpLoader} from "./transloco-loader";
import {getCookie} from "./app/utility/utilities";

bootstrapApplication(AppComponent, {
	providers: [
		provideHttpClient(),
		providePrimeNG({
			theme: {
				preset: myPreset,
				options: {darkModeSelector: ".dark-theme"},
			},
		}),
		provideTransloco({
			config: {
				availableLangs: ["en", "zh"],
				defaultLang: getCookie("language") || "en",
				reRenderOnLangChange: true,
				prodMode: !isDevMode(),
			},
			loader: TranslocoHttpLoader,
		}),
	],
}).catch(error => console.error(error));
