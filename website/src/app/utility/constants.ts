import {Board} from "../entity/board";

const SSD1322: Board = {
	type: "ssd1322",
	width: 256,
	height: 64,
	displaySizes: [
		{width: 128, height: 32},
		{width: 160, height: 24},
	],
};

const SSD1327: Board = {
	type: "ssd1327",
	width: 128,
	height: 64,
	displaySizes: [
		{width: 28, height: 14},
		{width: 36, height: 17},
	],
};

export const BOARDS: Board[] = [SSD1322, SSD1327, SSD1327];
export const SOURCES: string[] = ["kmb", "ctb", "nwfb"];
