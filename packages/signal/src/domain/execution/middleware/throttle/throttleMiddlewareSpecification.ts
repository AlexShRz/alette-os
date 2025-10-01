import { behaviouralMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const throttleMiddlewareName = middlewareCategory(
	"throttleMiddlewareName",
);

export const throttleMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(throttleMiddlewareName, behaviouralMiddleware)
	.build();
