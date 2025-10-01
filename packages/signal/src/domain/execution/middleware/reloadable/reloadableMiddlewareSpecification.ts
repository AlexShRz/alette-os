import { behaviouralMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const reloadableMiddlewareName = middlewareCategory(
	"reloadableMiddlewareName",
);

export const reloadableMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(reloadableMiddlewareName, behaviouralMiddleware)
	.build();
