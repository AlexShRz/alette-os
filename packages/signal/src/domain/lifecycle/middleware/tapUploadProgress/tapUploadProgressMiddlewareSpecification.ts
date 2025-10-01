import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapUploadProgressMiddlewareName = middlewareCategory(
	"tapUploadProgressMiddlewareName",
);

export const tapUploadProgressMiddlewareSpecification =
	middlewareSpecification()
		.categorizedAs(tapUploadProgressMiddlewareName, mapperMiddleware)
		.build();
