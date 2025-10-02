import { creationalMiddleware } from "../../../domain/middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../domain/specification";

export const activityLensMiddlewareName = middlewareCategory(
	"activityLensMiddlewareName",
);

export const activityLensMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(activityLensMiddlewareName, creationalMiddleware)
	.build();
