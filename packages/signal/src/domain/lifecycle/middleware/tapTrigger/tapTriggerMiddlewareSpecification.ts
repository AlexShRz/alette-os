import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapTriggerMiddlewareName = middlewareCategory(
	"tapTriggerMiddlewareName",
);

export const tapTriggerMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapTriggerMiddlewareName, mapperMiddleware)
	.build();
