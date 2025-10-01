import { behaviouralMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const retryWhenMiddlewareName = middlewareCategory(
	"retryWhenMiddlewareName",
);

export const retryWhenMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(retryWhenMiddlewareName, behaviouralMiddleware)
	.build();
