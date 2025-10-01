import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapDownloadProgressMiddlewareName = middlewareCategory(
	"tapDownloadProgressMiddlewareName",
);

export const tapDownloadProgressMiddlewareSpecification =
	middlewareSpecification()
		.categorizedAs(tapDownloadProgressMiddlewareName, mapperMiddleware)
		.build();
