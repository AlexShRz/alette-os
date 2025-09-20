import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { behaviouralMiddleware } from "../../../middleware";

export const throttleMiddlewareName = middlewareCategory(
	"throttleMiddlewareName",
);

export const throttleMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(throttleMiddlewareName, behaviouralMiddleware)
	.build();
