import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { behaviouralMiddleware } from "../../../middleware";

export const runOnMountMiddlewareName = middlewareCategory(
	"runOnMountMiddlewareName",
);

export const runOnMountMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(runOnMountMiddlewareName, behaviouralMiddleware)
	.build();
