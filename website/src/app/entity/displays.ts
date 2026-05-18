import {ByteReader} from "../utility/byte-reader";

export interface Displays {
	readonly width: number;
	readonly height: number;
	readonly imageCount: number;
	readonly byteReader: ByteReader;
	readonly indexList: { readonly groups: string[], readonly fileName: string }[];
}
