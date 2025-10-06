import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapMountMiddlewareName = middlewareCategory(
	"tapMountMiddlewareName",
);

export const tapMountMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapMountMiddlewareName, mapperMiddleware)
	.build();
