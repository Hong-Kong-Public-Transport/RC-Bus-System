import {inject, Injectable, signal} from "@angular/core";
import {BOARDS} from "../utility/constants";
import {PersistedServiceBase} from "./persisted.service.base";
import {PersistedDisplay} from "../entity/data";
import {LibraryService} from "./library.service";
import {BinaryBuilder} from "../utility/binary-builder";
import JSZip from "jszip";
import {ByteReader} from "../utility/byte-reader";
import {BYTES_PER_INT} from "../utility/utilities";

@Injectable({providedIn: "root"})
export class DisplaysService extends PersistedServiceBase<PersistedDisplay[][][]> {
	private readonly libraryService = inject(LibraryService);
	readonly displayGroups = signal<string[][][]>([]);

	override read(data: PersistedDisplay[][][]) {
		this.displayGroups.set(data.map(displayGroup => displayGroup.map(displaysForBoard => displaysForBoard.map(({fileName}) => fileName))));
	}

	override write(): PersistedDisplay[][][] {
		const persistedDisplays: PersistedDisplay[][][] = [];
		const zip = new JSZip();

		this.displayGroups().forEach((displayGroup, groupIndex) => {
			const persistedDisplaysForGroup: PersistedDisplay[][] = [];

			displayGroup.forEach((displaysForBoard, boardIndex) => {
				const binaryBuilder = new BinaryBuilder(groupIndex, boardIndex);
				const persistedDisplaysForBoardInGroup: PersistedDisplay[] = [];

				displaysForBoard.forEach(fileName => {
					const persistedDisplayAndDisplays = this.libraryService.getPersistedDisplayAndDisplays(fileName);
					if (persistedDisplayAndDisplays) {
						persistedDisplaysForBoardInGroup.push(persistedDisplayAndDisplays.persistedDisplay);
						binaryBuilder.add(persistedDisplayAndDisplays.displays, persistedDisplayAndDisplays.persistedDisplay.index);
					}
				});

				binaryBuilder.build(zip);
				persistedDisplaysForGroup.push(persistedDisplaysForBoardInGroup);
			});

			persistedDisplays.push(persistedDisplaysForGroup);
		});

		zip.generateAsync({type: "blob"}).then(blob => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "SD Card.zip";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		});

		return persistedDisplays;
	}

	addGroup() {
		const displayGroups = this.displayGroups();
		const displayGroup: string[][] = [];
		BOARDS.forEach(() => displayGroup.push([]));
		displayGroups.push(displayGroup);
		this.displayGroups.set(displayGroups);
	}

	addDisplay(groupIndex: number, boardIndex: number, fileName: string) {
		const displayGroups = this.displayGroups();
		displayGroups[groupIndex][boardIndex].push(fileName);
		this.displayGroups.set(displayGroups);
	}

	loadFromZip(zipFileBytes: Uint8Array) {
		new JSZip().loadAsync(zipFileBytes).then(zipFileData => {
			const displayGroups: string[][][] = [];
			this.displayGroups.set(displayGroups);

			Object.entries(zipFileData.files).forEach(([fileName, fileData]) => {
				if (!fileData.dir) {
					try {
						const fileNameSplit = fileName.split("/");
						const displayIndex = parseInt(fileNameSplit[1].split("_")[1]) - 1;
						const groupIndex = parseInt(fileNameSplit[2].split("_")[1]) - 1;

						fileData.async("arraybuffer").then(arrayBuffer => {
							try {
								const byteReader = new ByteReader(arrayBuffer);
								const imageCount = byteReader.readInt();

								for (let i = 0; i < imageCount; i++) {
									byteReader.seek((1 + i) * BYTES_PER_INT);
									const offset = byteReader.readInt();
									byteReader.seek(offset);
									const width = byteReader.readInt();
									const height = byteReader.readInt();
									const fileName = this.libraryService.getFileName(width, height, byteReader, offset + 2 * BYTES_PER_INT);

									if (fileName) {
										while (displayGroups.length <= groupIndex) {
											displayGroups.push([]);
										}

										while (displayGroups[groupIndex].length <= displayIndex) {
											displayGroups[groupIndex].push([]);
										}

										displayGroups[groupIndex][displayIndex].push(fileName);
									}
								}
							} catch (e) {
								console.error(e);
							}
						});
					} catch (e) {
						console.error(e);
					}
				}
			});
		});
	}
}
