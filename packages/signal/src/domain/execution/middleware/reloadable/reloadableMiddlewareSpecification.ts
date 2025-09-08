import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { behaviouralMiddleware } from "../../../middleware";

export const reloadableMiddlewareName = middlewareCategory(
	"reloadableMiddlewareName",
);

export const reloadableMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(reloadableMiddlewareName, behaviouralMiddleware)
	.build();
