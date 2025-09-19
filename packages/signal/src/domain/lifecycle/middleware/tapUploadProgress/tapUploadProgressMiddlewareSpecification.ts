import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { mapperMiddleware } from "../../../middleware";

export const tapUploadProgressMiddlewareName = middlewareCategory(
	"tapUploadProgressMiddlewareName",
);

export const tapUploadProgressMiddlewareSpecification =
	middlewareSpecification()
		.categorizedAs(tapUploadProgressMiddlewareName, mapperMiddleware)
		.build();
