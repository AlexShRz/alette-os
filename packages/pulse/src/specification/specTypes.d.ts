import {
	IAnyMiddlewareSpecification,
	MiddlewareSpecification,
} from "./middleware/MiddlewareSpecification";
import {
	IAnyRequestSpecification,
	RequestSpecification,
} from "./request/RequestSpecification";

type Brand<T, B> = T & { __brand: B };

export type MiddlewareCategory<T extends string = string> = Brand<
	T,
	"MiddlewareCategory"
>;

export type RequestCategory<T extends string = string> = Brand<
	T,
	"RequestCategory"
>;

type NotCompatibleMiddlewareError =
	"This middleware is not compatible with the current request.";

type HasIntersection<
	A extends readonly string[],
	B extends readonly string[],
> = A extends readonly [infer First, ...infer Rest]
	? First extends string
		? First extends B[number]
			? true
			: Rest extends readonly string[]
				? HasIntersection<Rest, B>
				: false
		: false
	: false;

export type VerifyMiddlewareCompatibility<
	RequestConstraints extends IAnyRequestSpecification,
	MiddlewareRequestConstraints extends IAnyMiddlewareSpecification,
	ReturnedValue,
> = RequestConstraints extends RequestSpecification<
	infer RequestTags,
	infer AllowedMiddlewareTags,
	infer ProhibitedMiddlewareTags
>
	? MiddlewareRequestConstraints extends MiddlewareSpecification<
			infer MiddlewareTags,
			infer MiddlewareProhibitedRequestTags
		>
		? HasIntersection<MiddlewareTags, ProhibitedMiddlewareTags> extends true
			? {
					error: NotCompatibleMiddlewareError;
					reason: "The request prohibits this middleware from being applied.";
				}
			: HasIntersection<
						MiddlewareProhibitedRequestTags,
						RequestTags
					> extends true
				? {
						error: NotCompatibleMiddlewareError;
						reason: "The middleware marks this request type as non-compatible with itself.";
					}
				: HasIntersection<MiddlewareTags, AllowedMiddlewareTags> extends true
					? ReturnedValue
					: {
							error: NotCompatibleMiddlewareError;
							reason: "The request hasn't marked this middleware as applicable to itself.";
						}
		: {
				error: NotCompatibleMiddlewareError;
				reason: "Invalid middleware constraints";
			}
	: {
			error: NotCompatibleMiddlewareError;
			reason: "Invalid request constraints";
		};
