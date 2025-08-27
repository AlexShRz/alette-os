import { MiddlewareSpecification } from "./MiddlewareSpecification";
import { RequestSpecification } from "./RequestSpecification";

type Brand<T, B> = T & { __brand: B };

export type MiddlewareCategory<T extends string = string> = Brand<
	T,
	"MiddlewareCategory"
>;

export type RequestCategory<T extends string = string> = Brand<
	T,
	"RequestCategory"
>;

/**
 * Ai slop below
 * */
type FastIntersection<
	A extends readonly any[],
	B extends readonly any[],
> = A[number] extends never
	? false
	: B[number] extends never
		? false
		: A[number] & B[number] extends never
			? false
			: true;

type CompatibilityError = {
	readonly error: "This middleware is not compatible with the current request.";
};

type CoreCompatibilityCheck<
	RequestTags extends readonly any[],
	AllowedMiddlewareTags extends readonly any[],
	ProhibitedMiddlewareTags extends readonly any[],
	MiddlewareTags extends readonly any[],
	MiddlewareApplicableRequestTags extends readonly any[],
	MiddlewareNotApplicableRequestTags extends readonly any[],
	ReturnedValue,
> = FastIntersection<MiddlewareTags, ProhibitedMiddlewareTags> extends true // Fast path: Check prohibitions first (most restrictive)
	? CompatibilityError
	: FastIntersection<
				MiddlewareNotApplicableRequestTags,
				RequestTags
			> extends true
		? CompatibilityError
		: // Fast path: No restrictions case (most common success case)
			AllowedMiddlewareTags extends []
			? MiddlewareApplicableRequestTags extends []
				? ReturnedValue
				: FastIntersection<
							MiddlewareApplicableRequestTags,
							RequestTags
						> extends true
					? ReturnedValue
					: CompatibilityError
			: // Request has allowlist
				MiddlewareApplicableRequestTags extends []
				? FastIntersection<MiddlewareTags, AllowedMiddlewareTags> extends true
					? ReturnedValue
					: CompatibilityError
				: // Both have restrictions
					FastIntersection<
							MiddlewareApplicableRequestTags,
							RequestTags
						> extends true
					? FastIntersection<MiddlewareTags, AllowedMiddlewareTags> extends true
						? ReturnedValue
						: CompatibilityError
					: CompatibilityError;

export type VerifyMiddlewareCompatibility<
	RequestConstraints extends RequestSpecification<any, any, any>,
	MiddlewareRequestConstraints extends MiddlewareSpecification<any, any, any>,
	ReturnedValue,
> = [RequestConstraints, MiddlewareRequestConstraints] extends [ // Single pattern match with immediate destructuring - avoids nested conditionals
	RequestSpecification<infer RT, infer AMT, infer PMT>,
	MiddlewareSpecification<infer MT, infer MART, infer MNART>,
]
	? CoreCompatibilityCheck<RT, AMT, PMT, MT, MART, MNART, ReturnedValue>
	: CompatibilityError;
