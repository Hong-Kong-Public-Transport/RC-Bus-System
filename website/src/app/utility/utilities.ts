import {Observable, retry} from "rxjs";

export const BYTES_PER_INT = 4;
export const BITS_PER_BYTE = 8;

export function getCookie(name: string) {
	const splitCookies = document.cookie.split("; ").filter(cookie => cookie.startsWith(name + "="));
	if (splitCookies.length > 0 && splitCookies[0].includes("=")) {
		return decodeURIComponent(splitCookies[0].split("=")[1]);
	} else {
		return "";
	}
}

export function setCookie(name: string, value: string) {
	document.cookie = `${name}=${value}; expires=${new Date(2999, 11, 31).toUTCString()}; path=/`;
}

export function safeParse<T>(value: string, defaultValue: T): T {
	try {
		return JSON.parse(value) as T;
	} catch {
		return defaultValue;
	}
}

export function setIfUndefined<T extends (string | number), U>(map: Record<T, U>, key: T, createInstance: () => U) {
	if (!(key in map)) {
		map[key] = createInstance();
	}
}

export function sortNumbers(item1: string, item2: string) {
	const item1FirstNumbers = /\d+/.exec(item1.split(/\s/)[0]);
	const item2FirstNumbers = /\d+/.exec(item2.split(/\s/)[0]);
	if (item1FirstNumbers && !item2FirstNumbers) {
		return -1;
	} else if (!item1FirstNumbers && item2FirstNumbers) {
		return 1;
	} else {
		const difference = item1FirstNumbers && item2FirstNumbers ? parseInt(item1FirstNumbers[0]) - parseInt(item2FirstNumbers[0]) : 0;
		return difference === 0 ? item1.localeCompare(item2) : difference;
	}
}

export function getUrl() {
	return document.location.host === "localhost:4200" ? "/assets" : "";
}

export function getWithRetry<T>(getRequest: Observable<T>, next: (data: T) => void) {
	getRequest.pipe(retry(3)).subscribe({next, error: error => console.error(error)});
}

export function getLanguageMapping(lang: string) {
	switch (lang) {
		case "en":
			return "English";
		case "zh":
			return "繁體中文";
		default:
			return lang;
	}
}
