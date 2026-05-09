import {Component, inject} from "@angular/core";
import {TranslocoDirective} from "@jsverse/transloco";
import {AccordionModule} from "primeng/accordion";
import {ButtonModule} from "primeng/button";
import {BOARDS} from "../../utility/constants";
import {DisplaysService} from "../../service/displays.service";
import {PanelModule} from "primeng/panel";
import {TooltipModule} from "primeng/tooltip";
import {LibraryService} from "../../service/library.service";
import {sortNumbers} from "../../utility/utilities";
import {DialogModule} from "primeng/dialog";
import {CanvasComponent} from "../canvas/canvas.component";
import {LibraryComponent} from "../library/library.component";
import {SaveButtonComponent} from "../save-button/save-button.component";
import {SortAndDeleteButtonsComponent} from "../sort-and-delete-buttons/sort-and-delete-buttons.component";
import {FileSelectEvent, FileUploadModule} from "primeng/fileupload";

@Component({
	selector: "app-displays",
	imports: [
		AccordionModule,
		PanelModule,
		ButtonModule,
		DialogModule,
		FileUploadModule,
		TooltipModule,
		TranslocoDirective,
		CanvasComponent,
		LibraryComponent,
		SaveButtonComponent,
		SortAndDeleteButtonsComponent,
	],
	templateUrl: "./displays.component.html",
	styleUrls: ["./displays.component.scss"],
})
export class DisplaysComponent {
	private readonly displaysService = inject(DisplaysService);
	private readonly libraryService = inject(LibraryService);

	readonly boards = BOARDS;

	getDisplayGroups() {
		return this.displaysService.displayGroups();
	}

	getGroupTitle(displayGroup: string[][]) {
		const groups: string[] = [];
		displayGroup.forEach(fileNames => fileNames.forEach(fileName => this.libraryService.pushGroups(fileName, groups)));
		return [...new Set(groups)].sort(sortNumbers).join(", ");
	}

	save() {
		return this.displaysService.displayGroups();
	}

	addGroup() {
		this.displaysService.addGroup();
	}

	loadFromZip(event: FileSelectEvent) {
		event.files[0].bytes().then(zipFileBytes => this.displaysService.loadFromZip(zipFileBytes));
	}

	openDialog(libraryComponent: LibraryComponent, groupIndex: number, boardIndex: number) {
		libraryComponent.open(BOARDS[boardIndex].displaySizes, groupIndex, boardIndex);
	}
}
