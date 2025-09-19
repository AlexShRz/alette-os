import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { mapperMiddleware } from "../../../middleware";

export const tapDownloadProgressMiddlewareName = middlewareCategory(
	"tapDownloadProgressMiddlewareName",
);

export const tapDownloadProgressMiddlewareSpecification =
	middlewareSpecification()
		.categorizedAs(tapDownloadProgressMiddlewareName, mapperMiddleware)
		.build();
