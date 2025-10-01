import { behaviouralMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const debounceMiddlewareName = middlewareCategory(
	"debounceMiddlewareName",
);

export const debounceMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(debounceMiddlewareName, behaviouralMiddleware)
	.build();
