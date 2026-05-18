import {Displays} from "../entity/displays";
import {BITS_PER_BYTE, BYTES_PER_INT} from "./utilities";
import {ByteReader} from "./byte-reader";

export class AnimationDriver {
	readonly canvas = document.createElement("canvas");
	private readonly context = this.canvas.getContext("2d");
	private readonly imageData?: ImageData;
	private nextFrame = 0;
	private frameIndex = 0;

	constructor(private readonly displays: Displays, private readonly displayIndex: number) {
		this.canvas.width = this.displays.width;
		this.canvas.height = this.displays.height;
		this.canvas.style.border = "2px solid var(--p-primary-color)";
		this.canvas.style.display = "block";
		this.canvas.style.height = "100%";
		this.canvas.style.imageRendering = "pixelated";
		this.imageData = this.context?.createImageData(this.displays.width, this.displays.height);
	}

	writeToImageData(time: number) {
		if (!this.context || !this.imageData || time < this.nextFrame) {
			return;
		}

		const {width, height, byteReader} = this.displays;
		byteReader.seek((3 + this.displayIndex) * BYTES_PER_INT);
		byteReader.seek(byteReader.readInt());

		for (let i = 0; i < width * height; i++) {
			this.drawPixel(i, false);
		}

		// Switch display type
		switch (byteReader.readByte()) {
			case 1: { // Generic animated
				const frameCount = byteReader.readInt();
				byteReader.skip(this.frameIndex * BYTES_PER_INT);
				byteReader.seek(byteReader.readInt());
				this.frameIndex = (this.frameIndex + 1) % frameCount;
				this.incrementNextFrame(time, byteReader.readInt() / 1000);
				AnimationDriver.readPackBits(byteReader, width, height, (x, y, filled) => this.drawPixel(x + y * width, filled));
				break;
			}
			case 2: { // Standard scroll
				const sameColumnCount = byteReader.readInt();
				const animatedColumnCount = byteReader.readInt();
				const frameCount = animatedColumnCount + width - sameColumnCount;
				this.frameIndex = (this.frameIndex + 1) % frameCount;
				this.incrementNextFrame(time, 30);

				AnimationDriver.readPackBits(byteReader, sameColumnCount + animatedColumnCount, height, (x, y, filled) => {
					if (x >= sameColumnCount) {
						x += width - sameColumnCount - this.frameIndex;
						if (x < sameColumnCount || x >= width) {
							return;
						}
					}
					this.drawPixel(x + y * width, filled);
				});

				break;
			}
			default: { // Generic image
				this.incrementNextFrame(time);
				AnimationDriver.readPackBits(byteReader, width, height, (x, y, filled) => this.drawPixel(x + y * width, filled));
				break;
			}
		}

		this.context.putImageData(this.imageData, 0, 0);
	}

	private incrementNextFrame(time: number, delay?: number) {
		if (delay) {
			this.nextFrame = Math.max(time, this.nextFrame + delay);
		} else {
			this.nextFrame = Number.MAX_SAFE_INTEGER;
		}
	}

	private drawPixel(index: number, filled: boolean) {
		if (this.imageData) {
			const newIndex = index * 4;
			const color = filled ? 0xFF : 0;
			this.imageData.data[newIndex] = color;
			this.imageData.data[newIndex + 1] = color;
			this.imageData.data[newIndex + 2] = color;
			this.imageData.data[newIndex + 3] = 0xFF;
		}
	}

	private static readPackBits(byteReader: ByteReader, width: number, height: number, callback: (x: number, y: number, filled: boolean) => void) {
		const drawByte = (decodedIndex: number, byte: number) => {
			const base = decodedIndex * BITS_PER_BYTE;
			for (let i = 0; i < BITS_PER_BYTE; i++) {
				callback((base + i) % width, Math.floor((base + i) / width), ((byte >> i) & 1) > 0);
			}
		};

		let decodedIndex = 0;
		while (decodedIndex < width * height / BITS_PER_BYTE) {
			const header = byteReader.readSignedByte();
			if (header >= 0) {
				// Literal run
				for (let i = 0; i < header + 1; i++) {
					drawByte(decodedIndex++, byteReader.readByte());
				}
			} else if (header > -128) {
				// Repeated bytes
				const value = byteReader.readByte();
				for (let i = 0; i < 1 - header; i++) {
					drawByte(decodedIndex++, value);
				}
			}
		}
	}
}
