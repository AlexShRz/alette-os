import { middlewareCategory } from "@alette/pulse";

export const creationalMiddleware = middlewareCategory("creationalMiddleware");

export const executionMiddleware = middlewareCategory("executionMiddleware");

export const behaviouralMiddleware = middlewareCategory(
	"behaviouralMiddleware",
);

export const mapperMiddleware = middlewareCategory("mapperMiddleware");
