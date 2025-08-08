import { UrlBuilder } from "./UrlBuilder";

export function makeUrl(url?: string, origin?: string) {
	if (!url) {
		return new UrlBuilder();
	}

	return UrlBuilder.fromOrThrow(url, origin);
}
