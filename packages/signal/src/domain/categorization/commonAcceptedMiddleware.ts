import { inputMiddlewareName } from "../arguments";
import { urlCreationMiddleware } from "../url";

const commonMiddleware = [
	inputMiddlewareName,
	...urlCreationMiddleware,
] as const;

export const allRequestMiddleware = [...commonMiddleware] as const;
