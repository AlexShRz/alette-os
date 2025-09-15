import {
	behaviouralMiddleware,
	creationalMiddleware,
	mapperMiddleware,
} from "../middleware";

export const allRequestMiddleware = [
	creationalMiddleware,
	behaviouralMiddleware,
	mapperMiddleware,
] as const;
