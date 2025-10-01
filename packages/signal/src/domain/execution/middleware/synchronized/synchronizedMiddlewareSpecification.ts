import { behaviouralMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const synchronizedMiddlewareName = middlewareCategory(
	"synchronizedMiddlewareName",
);

export const synchronizedMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(synchronizedMiddlewareName, behaviouralMiddleware)
	.build();
