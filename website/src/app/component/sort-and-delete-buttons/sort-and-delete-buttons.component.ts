import {Component, input} from "@angular/core";
import {TranslocoDirective} from "@jsverse/transloco";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";

@Component({
	selector: "app-sort-and-delete-buttons",
	imports: [
		ButtonModule,
		TooltipModule,
		TranslocoDirective,
	],
	templateUrl: "./sort-and-delete-buttons.component.html",
	styleUrls: ["./sort-and-delete-buttons.component.scss"],
})
export class SortAndDeleteButtonsComponent<T> {
	readonly data = input.required<T[]>();
	readonly index = input.required<number>();
	readonly count = input.required<number>();

	move(event: MouseEvent, direction: number) {
		event.stopPropagation();
		const data = this.data();
		const currentIndex = this.index();
		const newIndex = currentIndex + direction;
		if (newIndex >= 0 && newIndex < this.count()) {
			[data[currentIndex], data[newIndex]] = [data[newIndex], data[currentIndex]];
		}
	}

	delete(event: MouseEvent) {
		event.stopPropagation();
		const data = this.data();
		data.splice(this.index(), 1);
	}
}
