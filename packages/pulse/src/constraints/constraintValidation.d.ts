import { MiddlewareConstraint as MConstraint } from "./MiddlewareConstraint";
import { RequestConstraint as RConstraint } from "./RequestConstraint";

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

export type VerifyCompatibility<
	RequestConstraints extends RConstraint,
	MiddlewareRequestConstraints extends MConstraint,
	ReturnedValue,
> = RequestConstraints extends RConstraint<
	infer RequestTags,
	infer AllowedMiddlewareTags,
	infer ProhibitedMiddlewareTags
>
	? MiddlewareRequestConstraints extends MConstraint<
			infer MiddlewareTags,
			infer MiddlewareProhibitedRequestTags
		>
		? HasIntersection<MiddlewareTags, ProhibitedMiddlewareTags> extends true
			? {
					error: NotCompatibleMiddlewareError;
					reason: "The request prohibits this middleware from being used.";
				}
			: HasIntersection<
						MiddlewareProhibitedRequestTags,
						RequestTags
					> extends true
				? {
						error: NotCompatibleMiddlewareError;
						reason: "The middleware is not compatible with this request type.";
					}
				: HasIntersection<MiddlewareTags, AllowedMiddlewareTags> extends true
					? ReturnedValue // Success case!
					: {
							error: NotCompatibleMiddlewareError;
							reason: "The middleware is not registered with request 'allowed middleware' list.";
						}
		: {
				error: NotCompatibleMiddlewareError;
				reason: "Invalid middleware constraints";
			}
	: {
			error: NotCompatibleMiddlewareError;
			reason: "Invalid request constraints";
		};
