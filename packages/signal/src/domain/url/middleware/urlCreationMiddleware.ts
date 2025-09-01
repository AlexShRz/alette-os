import { originMiddlewareName } from "./origin";
import { pathMiddlewareName } from "./path";

export const urlCreationMiddleware = [
	originMiddlewareName,
	pathMiddlewareName,
] as const;
