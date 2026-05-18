import {BYTES_PER_INT} from "./utilities";

export class ByteReader {
	private readonly dataView: DataView;
	private position = 0;

	constructor(arrayBuffer: ArrayBuffer) {
		this.dataView = new DataView(arrayBuffer);
	}

	seek(offset: number) {
		this.position = offset;
	}

	skip(offset: number) {
		this.position += offset;
	}

	readByte() {
		return this.dataView.getUint8(this.position++);
	}

	readSignedByte() {
		return this.dataView.getInt8(this.position++);
	}

	readInt(): number {
		const value = this.dataView.getUint32(this.position, true);
		this.position += BYTES_PER_INT;
		return value;
	}

	getLength() {
		return this.dataView.byteLength;
	}
}
