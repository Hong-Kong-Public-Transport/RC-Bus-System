import {inject, Injectable, signal} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BOARDS, SOURCES} from "../utility/constants";
import {map} from "rxjs";
import {BYTES_PER_INT, getWithRetry, setIfUndefined} from "../utility/utilities";
import {ByteReader} from "../utility/byte-reader";
import {Displays} from "../entity/displays";
import {PersistedDisplay} from "../entity/data";
import {AnimationDriver} from "../utility/animation-driver";

@Injectable({providedIn: "root"})
export class LibraryService {
	private readonly displaysBySize = signal<Record<number, Record<number, Displays[]>>>({});
	private readonly displayDetailsByFileName = signal<Record<string, { displays: Displays, source: string, size: string, index: number, groups: string[] }>>({});

	constructor() {
		const httpClient = inject(HttpClient);
		const tempDisplaysBySize: Record<number, Record<number, Displays[]>> = {};
		const tempDisplayDetailsByFileName: Record<string, { displays: Displays, source: string, size: string, index: number, groups: string[] }> = {};
		let timeoutId = 0;

		SOURCES.forEach(source => BOARDS.forEach(board => board.displaySizes.forEach(({width, height}) => {
			const urlHeader = `/assets/display/${source}/${width}_${height}`;
			getWithRetry(httpClient.get(`${urlHeader}/displays.dat`, {responseType: "arraybuffer"}).pipe(map(arrayBuffer => new ByteReader(arrayBuffer))), byteReader => {
				// Read header
				const width = byteReader.readInt();
				const height = byteReader.readInt();
				const imageCount = byteReader.readInt();

				getWithRetry(httpClient.get<{ groups: string[], fileName: string }[]>(`${urlHeader}/index.json`), indexList => {
					setIfUndefined(tempDisplaysBySize, width, () => ({}));
					setIfUndefined(tempDisplaysBySize[width], height, () => []);

					const displays = {width, height, imageCount, byteReader, indexList};
					tempDisplaysBySize[width][height].push(displays);
					indexList.forEach(({fileName, groups}, index) => tempDisplayDetailsByFileName[fileName] = {displays, source, size: `${width}_${height}`, groups, index});

					clearTimeout(timeoutId);
					timeoutId = setTimeout(() => {
						this.displaysBySize.set(tempDisplaysBySize);
						this.displayDetailsByFileName.set(tempDisplayDetailsByFileName);
					}, 1000);
				});
			});
		})));
	}

	getDisplays(width: number, height: number): Displays[] | undefined {
		return this.displaysBySize()[width]?.[height];
	}

	getAnimationDriver(fileName: string) {
		const displayDetails = this.displayDetailsByFileName()[fileName];
		return displayDetails ? new AnimationDriver(displayDetails.displays, displayDetails.index) : undefined;
	}

	pushGroups(fileName: string, groups: string[]) {
		this.displayDetailsByFileName()[fileName]?.groups?.forEach(group => groups.push(group));
	}

	getPersistedDisplayAndDisplays(fileName: string): { persistedDisplay: PersistedDisplay, displays: Displays } | undefined {
		const displayDetails = this.displayDetailsByFileName()[fileName];
		return displayDetails ? {
			persistedDisplay: {
				fileName,
				source: displayDetails.source,
				size: displayDetails.size,
				index: displayDetails.index,
			},
			displays: displayDetails.displays,
		} : undefined;
	}

	getFileName(width: number, height: number, byteReader: ByteReader, offset: number) {
		const displaysList = this.displaysBySize()[width]?.[height];

		if (displaysList) {
			for (const displays of displaysList) {
				displays.byteReader.seek(0);
				const imageCount = displays.byteReader.readInt();

				for (let i = 0; i < imageCount; i++) {
					displays.byteReader.seek((3 + i) * BYTES_PER_INT);
					const offset1 = displays.byteReader.readInt();
					const offset2 = i === imageCount - 1 ? displays.byteReader.getLength() : displays.byteReader.readInt();
					byteReader.seek(offset);
					displays.byteReader.seek(offset1);
					let match = true;

					for (let j = offset1; j < offset2; j++) {
						if (byteReader.readByte() !== displays.byteReader.readByte()) {
							match = false;
							break;
						}
					}

					if (match) {
						return displays.indexList[i].fileName;
					}
				}
			}
		}

		return undefined;
	}
}
