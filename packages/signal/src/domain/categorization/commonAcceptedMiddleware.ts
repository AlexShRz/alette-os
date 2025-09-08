import { behaviouralMiddleware, creationalMiddleware } from "../middleware";

export const allRequestMiddleware = [
	creationalMiddleware,
	behaviouralMiddleware,
] as const;
