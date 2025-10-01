import { body } from "./body";
import { headers } from "./headers";
import { method } from "./method";
import { onDownloadProgress } from "./onDownloadProgress";
import { onUploadProgress } from "./onUploadProgress";
import { route } from "./route";
import { signal } from "./signal";

export const r = {
	body,
	headers,
	method,
	onUploadProgress,
	onDownloadProgress,
	route,
	signal,
};
