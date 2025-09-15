import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { mapperMiddleware } from "../../../middleware";

export const tapTriggerMiddlewareName = middlewareCategory(
	"tapTriggerMiddlewareName",
);

export const tapTriggerMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapTriggerMiddlewareName, mapperMiddleware)
	.build();
