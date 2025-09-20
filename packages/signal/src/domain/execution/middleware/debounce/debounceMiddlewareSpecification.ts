import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { behaviouralMiddleware } from "../../../middleware";

export const debounceMiddlewareName = middlewareCategory(
	"debounceMiddlewareName",
);

export const debounceMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(debounceMiddlewareName, behaviouralMiddleware)
	.build();
