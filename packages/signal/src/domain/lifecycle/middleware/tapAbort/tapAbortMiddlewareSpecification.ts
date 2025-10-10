import { mapperMiddleware } from "../../../middleware";
import {
	middlewareCategory,
	middlewareSpecification,
} from "../../../specification";

export const tapAbortMiddlewareName = middlewareCategory(
	"tapAbortMiddlewareName",
);

export const tapAbortMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(tapAbortMiddlewareName, mapperMiddleware)
	.build();
