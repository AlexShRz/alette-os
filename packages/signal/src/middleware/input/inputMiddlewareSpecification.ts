import { middlewareCategory, middlewareSpecification } from "@alette/pulse";
import { defaultRequest } from "../../blueprint/baseRequestCategories";

export const inputMiddlewareName = middlewareCategory("inputMiddlewareName");

export const inputMiddlewareSpecification = middlewareSpecification()
	.categorizedAs(inputMiddlewareName)
	.notApplicableTo(defaultRequest)
	.build();
