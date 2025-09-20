import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { creationalMiddleware } from "../../../domain/middleware";

export const activityLensMiddlewareName = middlewareCategory(
	"activityLensMiddlewareName",
);

export const activityLensMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(activityLensMiddlewareName, creationalMiddleware)
	.build();
