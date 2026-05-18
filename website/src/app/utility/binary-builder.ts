import {Displays} from "../entity/displays";
import {BITS_PER_BYTE, BYTES_PER_INT} from "./utilities";
import JSZip from "jszip";

export class BinaryBuilder {
	private readonly displaysWithIndex: { displays: Displays, index: number }[] = [];

	constructor(private readonly groupIndex: number, private readonly boardIndex: number) {
	}

	add(displays: Displays, index: number) {
		this.displaysWithIndex.push({displays, index});
	}

	build(zip: JSZip) {
		const buffer: number[] = [];
		BinaryBuilder.pushInt(buffer, this.displaysWithIndex.length);
		this.displaysWithIndex.forEach(() => BinaryBuilder.pushInt(buffer, 0)); // Placeholders for indices

		this.displaysWithIndex.forEach(({displays, index}, outputIndex) => {
			BinaryBuilder.setInt(buffer, buffer.length, (outputIndex + 1) * BYTES_PER_INT);
			BinaryBuilder.pushInt(buffer, displays.width);
			BinaryBuilder.pushInt(buffer, displays.height);

			displays.byteReader.seek(0);
			const libraryDisplayCount = displays.byteReader.readInt();
			displays.byteReader.seek((3 + index) * BYTES_PER_INT);
			const offset1 = displays.byteReader.readInt();
			const offset2 = index === libraryDisplayCount - 1 ? displays.byteReader.getLength() : displays.byteReader.readInt();
			displays.byteReader.seek(offset1);

			for (let i = offset1; i < offset2; i++) {
				buffer.push(displays.byteReader.readByte());
			}
		});

		zip.file(`display/display_${this.boardIndex + 1}/group_${this.groupIndex + 1}`, new Uint8Array(buffer));
	}

	static pushInt(buffer: number[], value: number) {
		for (let i = 0; i < BYTES_PER_INT; i++) {
			buffer.push((value >> (i * BITS_PER_BYTE)) & 0xFF);
		}
	}

	static setInt(buffer: number[], value: number, position: number) {
		for (let i = 0; i < BYTES_PER_INT; i++) {
			buffer[position + i] = (value >> (i * BITS_PER_BYTE)) & 0xFF;
		}
	}
}
