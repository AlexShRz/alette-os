import { body } from "./body";
import { headers } from "./headers";
import { method } from "./method";
import { onDownloadProgress } from "./onDownloadProgress";
import { onUploadProgress } from "./onUploadProgress";
import { outJson } from "./outJson";
import { outText } from "./outText";
import { route } from "./route";
import { signal } from "./signal";

export const r = {
	body,
	headers,
	outJson,
	outText,
	method,
	onUploadProgress,
	onDownloadProgress,
	route,
	signal,
};
