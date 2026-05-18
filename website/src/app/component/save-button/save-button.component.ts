import {Component, inject, input} from "@angular/core";
import {TranslocoDirective, TranslocoService} from "@jsverse/transloco";
import {ButtonModule} from "primeng/button";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {PersistenceService} from "../../service/persistence.service";

@Component({
	selector: "app-save-button",
	imports: [
		ButtonModule,
		ToastModule,
		TranslocoDirective,
	],
	templateUrl: "./save-button.component.html",
	styleUrls: ["./save-button.component.scss"],
	providers: [MessageService],
})
export class SaveButtonComponent<T> {
	private readonly persistenceService = inject(PersistenceService);
	private readonly messageService = inject(MessageService);
	private readonly translocoService = inject(TranslocoService);

	readonly successTranslationKey = input.required<string>();
	readonly errorTranslationKey = input.required<string>();
	readonly payloadProvider = input.required<() => T>();

	save() {
		this.persistenceService.save();
		this.messageService.add({severity: "success", summary: this.translocoService.translate("common.success"), detail: this.translocoService.translate(this.successTranslationKey())});
	}
}
