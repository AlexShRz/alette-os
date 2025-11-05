import { THttpBody, THttpMethod } from "@alette/pulse";
import { TIsExactlyLeft } from "@alette/type-utils";
import { Callable } from "../../../../shared/Callable";
import { allRequestMiddleware } from "../../../categorization";
import { IRequestContext } from "../../../context";
import {
	IRequestContextPatch,
	TApplyRequestContextPatches,
} from "../../../context/RequestContextPatches";
import { factoryMiddlewareName } from "../../../execution";
import { RequestMiddleware } from "../../../middleware/RequestMiddleware";
import {
	IAnyMiddlewareSpecification,
	IAnyRequestSpecification,
	MiddlewareSpecification,
	TVerifyMiddlewareCompatibility,
	requestSpecification,
} from "../../../specification";
import { IRequestBody } from "../../context/body/RequestBody";
import { IRequestMethod } from "../../context/method/RequestMethod";
import { TBodySupplier } from "../body/BodyMiddlewareFactory";
import { bodyMiddlewareSpecification } from "../body/bodyMiddlewareSpecification";
import { MethodMiddleware } from "./MethodMiddleware";
import {
	MethodMiddlewareFactory,
	TMethodSupplier,
} from "./MethodMiddlewareFactory";
import {
	methodMiddlewareName,
	methodMiddlewareSpecification,
} from "./methodMiddlewareSpecification";

export abstract class MiddlewareFacade<
	Fn extends (...args: any[]) => MiddlewareFacade<any, any, any, any>,
	Context extends IRequestContext,
	OutContext extends IRequestContextPatch<any, any>[],
	MiddlewareSpec extends IAnyMiddlewareSpecification,
> extends Callable<Fn> {
	protected abstract middlewareSpec: MiddlewareSpec;
	protected lastArgs: unknown | undefined;

	abstract getMiddleware(): RequestMiddleware<any, any>;

	protected constructor(supplier: Fn) {
		super(supplier);
	}

	/**
	 * All methods below are a hack, but necessary
	 * to make sure TS narrows down class generics to
	 * concrete values.
	 * */
	getSpecification() {
		return this.middlewareSpec;
	}

	/**
	 * 1. This method is a hack and needed only for TS to narrow down
	 * the context generic to a concrete value.
	 * 2. This is a hack, but all pre instantiated/point-free middleware will have Context
	 * that is exactly equal to "IRequestContext". If we return
	 * the "Context" generic here directly, TS will error. We need to
	 * downcast the generic to "any" and manually merge known Context
	 * type data in our "with()" method, not here.
	 * */
	getContext(): TIsExactlyLeft<IRequestContext, Context> extends true
		? any
		: Context {
		return {} as any;
	}

	getOutContext() {
		return {} as OutContext;
	}
}

class Method<
	InContext extends IRequestContext,
	HttpMethod extends THttpMethod,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, HttpMethod extends THttpMethod>(
		args: TMethodSupplier<_InContext, HttpMethod>,
	) => Method<_InContext, HttpMethod>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestMethod<
				TIsExactlyLeft<THttpMethod, HttpMethod> extends true
					? "GET"
					: HttpMethod
			>;
		}>,
	],
	typeof methodMiddlewareSpecification
> {
	protected middlewareSpec = methodMiddlewareSpecification;

	constructor(protected override lastArgs: TMethodSupplier<any, any> = "GET") {
		super((args) => new Method(args));
	}

	getMiddleware(): RequestMiddleware<any, any> {
		// TODO: Need to add assertion for this.lastArgs here,
		// because it can be undefined
		return new MethodMiddlewareFactory(
			() => new MethodMiddleware(this.lastArgs as TMethodSupplier),
		);
	}
}

class Body<
	InContext extends IRequestContext,
	NewBody extends THttpBody,
> extends MiddlewareFacade<
	<_InContext extends IRequestContext, NewBody extends THttpBody>(
		args: TBodySupplier<NewBody, _InContext>,
	) => Body<_InContext, NewBody>,
	InContext,
	[
		IRequestContextPatch<{
			value: IRequestBody<NewBody>;
		}>,
		/**
		 * 1. If our headers are non-existent,
		 * set empty record to act as a header type.
		 * 2. This allows us to access this property in context
		 * without getting ts errors, while also keeping system
		 * injected body headers hidden from the type system.
		 * */
		IRequestContextPatch<
			{
				value: {
					headers: {};
				};
			},
			"merge"
		>,
	],
	typeof bodyMiddlewareSpecification
> {
	constructor() {
		super((args) => new Body()(args));
	}
}

const method = new Method();
const body = new Body();

const adssa = method("GET");

type TAnyMiddlewareFacade<
	Context extends IRequestContext,
	OutContext extends IRequestContextPatch<any, any>[],
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	RequestSpec extends IAnyRequestSpecification,
> = MiddlewareFacade<
	any,
	Context,
	OutContext,
	/**
	 * 1. Yes, it's ok to have @ts-expect-error
	 * here. Without it, type level middleware + request
	 * specification validation will not work.
	 * 2. @ts-expect-error will not prevent TS from analyzing
	 * the type.
	 * */
	// @ts-expect-error
	TVerifyMiddlewareCompatibility<RequestSpec, MiddlewareSpec, MiddlewareSpec>
>;

class PipeTest<
	Context extends IRequestContext,
	RequestSpec extends IAnyRequestSpecification,
> {
	getContext(): Context["value"] {
		return {} as any;
	}

	pipe<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
	): PipeTest<TApplyRequestContextPatches<Context, NC1>, RequestSpec>;
	pipe<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
	): PipeTest<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
		RequestSpec
	>;
	pipe<
		NC1 extends IRequestContextPatch<any, any>[],
		MC1 extends IAnyMiddlewareSpecification,
		NC2 extends IRequestContextPatch<any, any>[],
		MC2 extends IAnyMiddlewareSpecification,
		NC3 extends IRequestContextPatch<any, any>[],
		MC3 extends IAnyMiddlewareSpecification,
	>(
		m1: TAnyMiddlewareFacade<Context, NC1, MC1, RequestSpec>,
		m2: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, NC1>,
			NC2,
			MC2,
			RequestSpec
		>,
		m3: TAnyMiddlewareFacade<
			TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
			NC3,
			MC3,
			RequestSpec
		>,
	): PipeTest<
		TApplyRequestContextPatches<Context, [...NC1, ...NC2, ...NC3]>,
		RequestSpec
	>;
	pipe(...middleware: TAnyMiddlewareFacade<any, any, any, any>[]) {
		return this as any;
	}
}

const spec = requestSpecification()
	.accepts(...allRequestMiddleware, factoryMiddlewareName)
	// .prohibits(methodMiddlewareName)
	.build();

const pipeline = new PipeTest<
	IRequestContext & { value: { body: string; heyy: string; method: "DELETE" } },
	typeof spec
>();

const boundMethod = method("OPTIONS");
const boundBody = body({ asdasd: "" });

const test = pipeline
	.pipe(
		// body,
		// boundBody1,
		// boundMethod,
		// boundMethod,
		method,
		// method(({ context, heyy, method, body }) => "POST" as const),
		// boundMethod,
		boundBody,
		method(({ context, heyy, method, body }) => "OPTIONS" as const),
		// method(({ context, heyy, method, body }) => "PUT" as const),
		// boundMethod,
		// method(({ context, heyy, method, body }) => "GET" as const),
		// method,
		// method(({ context, heyy, method, body }) => "POST" as const),
		// body(({ method }) => ''),
		// bodyaweasd,
		// def,
		// ...withCommonMiddleware(),
		// boundPutMethod,
		// ...adssa,
		// () => {}
		// // boundBody2,
		// body({ hiThere: true }),
		// withDelete,
		// method(({ context, heyy, method, body }) => "POST" as const),
		// method((data) => "POST" as const),
		// method(({ context, method, heyy }) => "GET" as const),
	)
	.getContext();
