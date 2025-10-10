import { behaviouralMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const abortedByMiddlewareName = middlewareCategory(
	"abortedByMiddlewareName",
);

export const abortedByMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(abortedByMiddlewareName, behaviouralMiddleware)
	.build();
