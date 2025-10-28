import { THttpBody, THttpMethod } from "@alette/pulse";
import type { List, O } from "ts-toolbelt";
import { Callable } from "../../../shared/Callable";
import { DeepMerge } from "../../../shared/typeUtils/DeepMerge";
import { DeepReplace } from "../../../shared/typeUtils/DeepReplace";
import { IRequestContext } from "../../context";
import {
	TFullRequestContext,
	TRequestGlobalContext,
	TRequestSettings,
} from "../../context/typeUtils/RequestIOTypes";
import {
	TFlattenIntersections,
	TMergeRecords,
} from "../../context/typeUtils/TMergeRecords";
import { TRequestBody } from "../../preparation/context/body/RequestBody";
import { TGetRequestHeaders } from "../../preparation/context/headers/RequestHeaders";
// import { TDeepMergeRecords } from "../../context/typeUtils/TDeepMergeRecords";
// import { TMethodSupplier } from "../../preparation";
import { IRequestMethod } from "../../preparation/context/method/RequestMethod";
import { BodyMiddleware } from "../../preparation/middleware/body/BodyMiddleware";
import {
	BodyMiddlewareFactory,
	TBodySupplier,
} from "../../preparation/middleware/body/BodyMiddlewareFactory";
import { bodyMiddlewareSpecification } from "../../preparation/middleware/body/bodyMiddlewareSpecification";
import { MethodMiddleware } from "../../preparation/middleware/method/MethodMiddleware";
import { MethodMiddlewareFactory } from "../../preparation/middleware/method/MethodMiddlewareFactory";
import { methodMiddlewareSpecification } from "../../preparation/middleware/method/methodMiddlewareSpecification";
import type { IAnyMiddlewareSpecification } from "../../specification";
import { RequestMiddleware } from "../RequestMiddleware";

/**
 * Variations
 * method(),
 * method,
 * method('POST')
 *
 * 1. The .use() method should treat them
 * all as the same type
 * 2. The method should be able to extract next
 * context and middleware specification
 * 3. It makes no different what the middleware
 * function returns, as long as the returned type
 * allows the ".use()" method to extract next context
 * and middleware specification
 * */

type TRequestContextPatchStrategy = "replace" | "merge";

interface IRequestContextPatch<
	Patch extends object = {},
	Strategy extends TRequestContextPatchStrategy = "replace",
> {
	patch: Patch;
	strategy: Strategy;
}

// // Fold patches left-to-right
type TApplyPatches<
	Context extends object,
	Patches extends IRequestContextPatch<any, any>[],
> = Patches extends [infer Head, ...infer Tail]
	? Head extends IRequestContextPatch<any, any>
		? Tail extends IRequestContextPatch<any, any>[]
			? TApplyPatches<TApplySinglePatch<Context, Head>, Tail>
			: TApplySinglePatch<Context, Head>
		: Context
	: Context;

// https://www.reddit.com/r/typescript/comments/i8vxz2/comment/g1b51g0/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
type TIsExactlyLeft<
	TExpected,
	TActual extends TExpected,
> = TExpected extends TActual ? true : false;

interface IMiddlewareFacadeConfig<
	InContext extends IRequestContext,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContext extends IRequestContext,
> {
	lastArgs: Arguments;
	middlewareSpec: MiddlewareSpec;
	validateArgs: (args: unknown) => void;
	middlewareFactory: (
		args: Arguments,
	) => RequestMiddleware<OutContext, MiddlewareSpec>;
}

export class MiddlewareFacade<
	InContext extends IRequestContext,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContextPatches extends IRequestContextPatch<any, any>[],
> extends Callable<
	[Arguments],
	<_Arguments, _OutContextPatches extends IRequestContextPatch<any, any>[]>(
		args: _Arguments[],
	) => MiddlewareFacade<
		TApplyPatches<InContext, OutContextPatches>,
		MiddlewareSpec,
		_Arguments,
		_OutContextPatches
	>
> {
	constructor(
		// protected config: IMiddlewareFacadeConfig<
		// 	InContext,
		// 	MiddlewareSpec,
		// 	Arguments,
		// 	// TApplyContextPatches<InContext, OutContextPatches>
		// 	InContext
		// >,
		protected config: IMiddlewareFacadeConfig<any, any, Arguments, any>,
	) {
		super((args) => new MiddlewareFacade(config)(args));
	}

	getMiddleware() {
		const { middlewareFactory, validateArgs, lastArgs } = this.config;
		validateArgs(lastArgs);
		return middlewareFactory(lastArgs);
	}

	getSpecification() {
		return this.config.middlewareSpec;
	}
}

export type TMethodSupplier<
	Method extends THttpMethod = THttpMethod,
	C extends IRequestContext = IRequestContext,
> =
	| ((requestContext: TFullRequestContext<C>) => Method | Promise<Method>)
	| Method;

const method = <InContext extends IRequestContext, Method extends THttpMethod>(
	supplier: TMethodSupplier<Method, InContext>,
) =>
	new MiddlewareFacade<
		InContext,
		typeof methodMiddlewareSpecification,
		TMethodSupplier<Method, InContext>,
		[
			IRequestContextPatch<{
				value: IRequestMethod<
					TIsExactlyLeft<THttpMethod, Method> extends true ? "GET" : Method
				>;
			}>,
		]
	>({
		lastArgs: supplier,
		middlewareSpec: methodMiddlewareSpecification,
		validateArgs: () => {},
		middlewareFactory: (args) =>
			new MethodMiddlewareFactory(
				() => new MethodMiddleware(args as TMethodSupplier),
			),
	});

const body = <InContext extends IRequestContext, Body extends THttpBody>(
	bodySupplier: TBodySupplier<Body, InContext>,
) =>
	new MiddlewareFacade<
		InContext,
		typeof bodyMiddlewareSpecification,
		TBodySupplier<Body, InContext>,
		[
			IRequestContextPatch<{
				value: TRequestBody<
					InContext,
					TIsExactlyLeft<THttpBody, Body> extends true ? { no: string } : Body,
					TGetRequestHeaders<InContext>
				>;
			}>,
		]
	>({
		lastArgs: bodySupplier,
		middlewareSpec: bodyMiddlewareSpecification,
		validateArgs: () => {},
		middlewareFactory: (args) =>
			new BodyMiddlewareFactory(
				() => new BodyMiddleware(args as TBodySupplier),
			),
	});

type AnyMiddlewareFacade<
	InContext extends object,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContextPatches extends IRequestContextPatch<any, any>[],
> = /**
 * Matches point-free middleware. This
 * is important, DO NOT REMOVE OR CHANGE it.
 * */
| ((...args: any[]) => MiddlewareFacade<
		// @ts-expect-error
		InContext,
		MiddlewareSpec,
		Arguments,
		OutContextPatches
  >)
/**
 * Matches preconfigured + normal middleware.
 * */
// @ts-expect-error
| MiddlewareFacade<InContext, MiddlewareSpec, Arguments, OutContextPatches>;

type TSpec<T> = T extends AnyMiddlewareFacade<any, infer Spec, any, any>
	? Spec
	: false;

type TInContext<T> = T extends AnyMiddlewareFacade<infer C, any, any, any>
	? C
	: false;

type TArgs<T> = T extends AnyMiddlewareFacade<any, any, infer A, any>
	? A
	: false;

type TOutContext<T> = T extends AnyMiddlewareFacade<any, any, any, infer C>
	? C
	: false;

type TTest<T extends AnyMiddlewareFacade<any, any, any, any>> = true;

const def = method;
const withGet = method("GET");
const withDelete = method("DELETE");

const boundPutMethod = method(() => "PUT");
const boundBody1 = body("asdas");
const boundBody2 = body({ helloooo: "there" });
const bodyaweasd = body;

type ASdadasd = TTest<typeof withGet>;
type ASdadasdasdasd = TTest<typeof boundBody2>;
type ASdadasd2 = TTest<typeof def>;
type sss = TSpec<typeof withGet>;
type sss2 = TSpec<typeof def>;
type out = TOutContext<typeof withDelete>;
type out2 = TOutContext<typeof def>;

type TApplySinglePatch<
	Context extends object,
	Patch extends IRequestContextPatch<any, any>,
> = Patch["strategy"] extends "merge"
	? DeepMerge<Context, Patch["patch"]>
	: DeepReplace<Context, Patch["patch"]>;

type Final1 = TApplyPatches<
	{ value: { test: string } },
	TOutContext<typeof withDelete>
>;
type Final2 = TApplyPatches<
	{ we: string; value: { test: string; body: { hii: string } } },
	TOutContext<typeof boundBody2>
>;

type Final3 = TApplyPatches<
	{ value: { body: string; heyy: string; method: "DELETE" } },
	TOutContext<typeof boundBody2>
>;

type Final4 = TApplyPatches<
	// { hey: string; value: { body: string; heyy: string; method: "DELETE" } },
	{
		hey: string;
		value: { body: { hi: string }; heyy: string; method: "DELETE" };
	},
	[
		// IRequestContextPatch<
		// 	{ wr: string; value: { body: { hi: string }; method: "PATCH" } },
		// 	"replace"
		// >,
		IRequestContextPatch<{
			mergeMe: string;
			value: { body: { helloo: string }; mergeMe2: string };
		}>,
	]
>;

type Final5 = TApplyPatches<
	// { hey: string; value: { body: string; heyy: string; method: "DELETE" } },
	{
		hey: string;
		value: { errors: "hi" | "there"; heyy: string; method: "DELETE" };
	},
	[
		// IRequestContextPatch<
		// 	{ wr: string; value: { body: { hi: string }; method: "PATCH" } },
		// 	"replace"
		// >,
		IRequestContextPatch<
			{
				value: { errors: "hello"; mergeMe2: string };
			},
			"merge"
		>,
	]
>;

/**
 * Caveats
 * 1. We need to merge context into
 * next PipeTest "context" type manually, because
 * pre bound middleware do not have the context type
 * in place. This means that it is lost if not merged
 * manually.
 *  1. There's also an issue where if you add a point-free middleware
 *  after normal middleware, it will lose all previous context provided
 *  by "upstream" middleware. To fix it, we need to merge everything manually
 *  at the end of the chain (see below).
 * 	2. To merge it properly, extract last "outContext" type and merge it like this -
 * 	PipeTest<TDeepMergeRecords<LAST_OUT_CONTEXT_TYPE, [PREV2, PREV1, Context]>>;
 * */
class PipeTest<Context extends IRequestContext> {
	getContext(): Context["value"] {
		return {} as any;
	}

	pipe<NC1 extends IRequestContextPatch<any, any>[]>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
	): PipeTest<TApplyPatches<Context, NC1>>;
	pipe<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
	>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
		m2: AnyMiddlewareFacade<TApplyPatches<Context, NC1>, any, any, NC2>,
	): PipeTest<TApplyPatches<Context, [...NC1, ...NC2]>>;
	pipe<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
	>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
		m2: AnyMiddlewareFacade<TApplyPatches<Context, NC1>, any, any, NC2>,
		m3: AnyMiddlewareFacade<
			TApplyPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
	): PipeTest<TApplyPatches<Context, [...NC1, ...NC2, ...NC3]>>;
	pipe(
		...middleware: AnyMiddlewareFacade<any, any, any, any>[]
	): PipeTest<Context> {
		return this as any;
	}
}

const pipeline = new PipeTest<
	IRequestContext & { value: { body: string; heyy: string; method: "DELETE" } }
>();

class Slot<
	Context extends IRequestContext,
	Middleware extends AnyMiddlewareFacade<any, any, any, any>[],
> extends Callable<[], Middleware> {
	constructor(protected middleware = [] as unknown as Middleware) {
		super(() => this.middleware);
	}

	static toFactory() {
		const slot = new Slot();
		return slot.with.bind(slot);
	}

	with<NC1 extends IRequestContextPatch<any, any>[]>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
	): Slot<TApplyPatches<Context, NC1>, [typeof m1]>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
	>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
		m2: AnyMiddlewareFacade<TApplyPatches<Context, NC1>, any, any, NC2>,
	): Slot<TApplyPatches<Context, [...NC1, ...NC2]>, [typeof m1, typeof m2]>;
	with<
		NC1 extends IRequestContextPatch<any, any>[],
		NC2 extends IRequestContextPatch<any, any>[],
		NC3 extends IRequestContextPatch<any, any>[],
	>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
		m2: AnyMiddlewareFacade<TApplyPatches<Context, NC1>, any, any, NC2>,
		m3: AnyMiddlewareFacade<
			TApplyPatches<Context, [...NC1, ...NC2]>,
			any,
			any,
			NC3
		>,
	): Slot<
		TApplyPatches<Context, [...NC1, ...NC2, ...NC3]>,
		[typeof m1, typeof m2, typeof m3]
	>;
	with(
		...middleware: AnyMiddlewareFacade<any, any, any, any>[]
	): Slot<any, any> {
		return new Slot([...middleware]) as any;
	}
}

const slot = Slot.toFactory();

const withCommonMiddleware = slot(
	def,
	boundBody1,
	method(({ context, method, body }) => "POST" as const),
);

const test = pipeline.pipe(
	// body,
	// boundBody1,
	// // method,
	// // body(({ method }) => ''),
	// bodyaweasd,
	// def,
	// method(({ context, heyy, method, body }) => "POST" as const),
	...withCommonMiddleware(),
	// boundPutMethod,
	// ...adssa,
	// () => {}
	// // boundBody2,
	// // body({ hiThere: true }),
	// withDelete,
	// method(({ context, heyy, method, body }) => "POST" as const),
	// method((data) => "POST" as const),
	// method(({ context, method, heyy }) => "GET" as const),
);
// .getContext();

const test2 = test.pipe(
	method(({ context, heyy, method, body }) => "POST" as const),
);
