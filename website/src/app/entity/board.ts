export interface Board {
	readonly type: "ssd1322" | "ssd1327";
	readonly width: number;
	readonly height: number;
	readonly displaySizes: { readonly width: number, readonly height: number }[];
}
