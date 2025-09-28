import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { behaviouralMiddleware } from "../../../middleware";

export const synchronizedMiddlewareName = middlewareCategory(
	"synchronizedMiddlewareName",
);

export const synchronizedMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(synchronizedMiddlewareName, behaviouralMiddleware)
	.build();
