import { behaviouralMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const runOnMountMiddlewareName = middlewareCategory(
	"runOnMountMiddlewareName",
);

export const runOnMountMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(runOnMountMiddlewareName, behaviouralMiddleware)
	.build();
