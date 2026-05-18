import {Component, effect, ElementRef, inject, signal, viewChild} from "@angular/core";
import {TranslocoDirective} from "@jsverse/transloco";
import {LibraryService} from "../../service/library.service";
import {DisplaysService} from "../../service/displays.service";
import {TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {Displays} from "../../entity/displays";
import {CanvasComponent} from "../canvas/canvas.component";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {FloatLabelModule} from "primeng/floatlabel";
import {sortNumbers} from "../../utility/utilities";
import {FormsModule} from "@angular/forms";

@Component({
	selector: "app-library",
	imports: [
		DialogModule,
		TableModule,
		InputTextModule,
		FloatLabelModule,
		TooltipModule,
		TranslocoDirective,
		CanvasComponent,
		FormsModule,
	],
	templateUrl: "./library.component.html",
	styleUrls: ["./library.component.scss"],
})
export class LibraryComponent {
	private readonly displaysService = inject(DisplaysService);
	private readonly libraryService = inject(LibraryService);

	private readonly wrapperRef = viewChild.required<ElementRef<HTMLDivElement>>("wrapper");
	private readonly displaySettings = signal<{ displaySizes: { width: number, height: number }[], groupIndex: number, boardIndex: number }>({
		displaySizes: [],
		groupIndex: 0,
		boardIndex: 0,
	});
	readonly rows = signal<{ displays: Displays, groups: string[], fileName: string }[]>([]);
	readonly searchTerm = signal("");
	readonly rowCount = signal(1);
	readonly firstIndex = signal(0);
	readonly rowHeight = 64;
	dialogVisible = false;

	constructor() {
		window.addEventListener("resize", () => this.rowCount.set(Math.max(1, Math.floor((this.wrapperRef().nativeElement.clientHeight - 130) / this.rowHeight))));
		effect(() => {
			this.searchTerm();
			this.search();
		});
	}

	open(displaySizes: { width: number, height: number }[], groupIndex: number, boardIndex: number) {
		this.dialogVisible = true;
		this.displaySettings.set({displaySizes, groupIndex, boardIndex});

		setTimeout(() => {
			const event = new Event("resize", {bubbles: true, cancelable: true, composed: true});
			for (const child of this.wrapperRef().nativeElement.children) {
				child.dispatchEvent(event);
			}
			this.search();
		});
	}

	search() {
		this.firstIndex.set(0);
		const tempRows: { displays: Displays, groups: string[], fileName: string }[] = [];
		this.displaySettings().displaySizes.forEach(({width, height}) => {
			const displaysList = this.libraryService.getDisplays(width, height);
			if (displaysList) {
				displaysList.forEach(displays => displays.indexList.forEach(({fileName, groups}) => {
					if (this.searchTerm() === "" || groups.some(group => group.toLowerCase().includes(this.searchTerm().toLowerCase()))) {
						tempRows.push({displays, groups, fileName});
					}
				}));
			}
		});

		tempRows.sort((a, b) => {
			const result = sortNumbers(a.groups[0], b.groups[0]);
			if (result !== 0) {
				return result;
			}
			return a.groups.join(", ").localeCompare(b.groups.join(", "));
		});

		this.rows.set(tempRows);
	}

	addDisplay(fileName: string) {
		this.displaysService.addDisplay(this.displaySettings().groupIndex, this.displaySettings().boardIndex, fileName);
		this.dialogVisible = false;
	}
}
