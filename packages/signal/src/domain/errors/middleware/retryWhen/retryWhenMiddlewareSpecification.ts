import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { behaviouralMiddleware } from "../../../middleware";

export const retryWhenMiddlewareName = middlewareCategory(
	"retryWhenMiddlewareName",
);

export const retryWhenMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(retryWhenMiddlewareName, behaviouralMiddleware)
	.build();
