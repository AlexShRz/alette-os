import { inputMiddlewareName } from "./input/inputMiddlewareSpecification";

const commonMiddleware = [inputMiddlewareName] as const;

export const allRequestMiddleware = [...commonMiddleware] as const;
