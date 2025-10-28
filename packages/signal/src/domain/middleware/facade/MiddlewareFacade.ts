import { THttpBody, THttpMethod } from "@alette/pulse";
import type { List, O } from "ts-toolbelt";
import { Callable } from "../../../shared/Callable";
import { IRequestContext } from "../../context";
import {
	TFullRequestContext,
	TRequestGlobalContext,
	TRequestSettings,
} from "../../context/typeUtils/RequestIOTypes";
// import { TMergeRecords } from "../../context/typeUtils/TMergeRecords";
// import { TMethodSupplier } from "../../preparation";
import { IRequestMethod } from "../../preparation/context/method/RequestMethod";
import { TBodySupplier } from "../../preparation/middleware/body/BodyMiddlewareFactory";
import { methodMiddlewareSpecification } from "../../preparation/middleware/method/methodMiddlewareSpecification";
import type { IAnyMiddlewareSpecification } from "../../specification";

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
type TMergeRecords<Left extends object, Right extends object[]> = O.MergeAll<
	Left,
	Right,
	"deep"
>;

// https://www.reddit.com/r/typescript/comments/i8vxz2/comment/g1b51g0/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
type TIsExactlyLeft<
	TExpected,
	TActual extends TExpected,
> = TExpected extends TActual ? true : false;

export class MiddlewareFacade<
	InContext extends IRequestContext,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContext extends IRequestContext,
> extends Callable<
	[Arguments],
	<
		_MiddlewareSpec extends IAnyMiddlewareSpecification,
		_Arguments,
		_OutContext extends IRequestContext,
	>(
		args: _Arguments[],
	) => MiddlewareFacade<OutContext, _MiddlewareSpec, _Arguments, _OutContext>
> {
	constructor(
		protected middlewareSpec: MiddlewareSpec,
		protected lastArgs: Arguments,
	) {
		super(new MiddlewareFacade(middlewareSpec, lastArgs));
	}

	// TODO: Must throw an error
	// if our factory is null
	// getMiddleware(): RequestMiddleware<InContext, MiddlewareSpec> {
	// 	throw new Error();
	// }

	getSpecification() {
		return this.middlewareSpec;
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
		TMergeRecords<
			InContext,
			/**
			 * We can set default types here
			 * */
			[
				{
					value: IRequestMethod<
						TIsExactlyLeft<THttpMethod, Method> extends true ? "GET" : Method
					>;
				},
			]
		>
	>(methodMiddlewareSpecification, supplier);

const body = <InContext extends IRequestContext, Body extends THttpBody>(
	body: TBodySupplier<Body, InContext>,
) =>
	new MiddlewareFacade<
		InContext,
		typeof methodMiddlewareSpecification,
		TBodySupplier<Body, InContext>,
		TMergeRecords<
			InContext,
			[
				{
					value: {
						body: TIsExactlyLeft<THttpBody, Body> extends true ? {} : Body;
					};
				},
			]
		>
	>(methodMiddlewareSpecification, body);

type AnyMiddlewareFacade<
	InContext extends object,
	MiddlewareSpec extends IAnyMiddlewareSpecification,
	Arguments,
	OutContext extends object,
> =
	| ((
			...args: any[]
			// @ts-expect-error
	  ) => MiddlewareFacade<InContext, MiddlewareSpec, Arguments, OutContext>)
	// @ts-expect-error
	| MiddlewareFacade<InContext, MiddlewareSpec, Arguments, OutContext>;

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

type ASdadasd = TTest<typeof withGet>;
type ASdadasd2 = TTest<typeof def>;
type sss = TSpec<typeof withGet>;
type sss2 = TSpec<typeof def>;
type out = TOutContext<typeof withGet>;
type out2 = TOutContext<typeof def>;

const boundMethod = method(() => "PUT");
const boundBody1 = body("asdas");
const boundBody2 = body({ helloooo: "there" });
const bodyaweasd = body;

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
 * 	PipeTest<TMergeRecords<LAST_OUT_CONTEXT_TYPE, [PREV2, PREV1, Context]>>;
 * */
class PipeTest<Context extends object> {
	// @ts-expect-error
	getContext(): Context["value"] {
		return {} as any;
	}

	// @ts-expect-error
	pipe<NC1 extends IRequestContext>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
	): PipeTest<TMergeRecords<NC1, [Context]>>;
	pipe<NC1 extends IRequestContext, NC2 extends IRequestContext>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
		m2: AnyMiddlewareFacade<TMergeRecords<NC1, [Context]>, any, any, NC2>,
	): PipeTest<TMergeRecords<NC2, [NC1, Context]>>;
	pipe<
		NC1 extends IRequestContext,
		NC2 extends IRequestContext,
		NC3 extends IRequestContext,
	>(
		m1: AnyMiddlewareFacade<Context, any, any, NC1>,
		m2: AnyMiddlewareFacade<TMergeRecords<NC1, [Context]>, any, any, NC2>,
		m3: AnyMiddlewareFacade<TMergeRecords<NC2, [NC1, Context]>, any, any, NC3>,
	): PipeTest<TMergeRecords<NC3, [NC2, NC1, Context]>>;
	pipe(
		...middleware: AnyMiddlewareFacade<any, any, any, any>[]
	): PipeTest<Context> {
		return {} as any;
	}
}

const pipeline = new PipeTest<
	IRequestContext & { value: { body: string; heyy: string; method: "DELETE" } }
>();

const test = pipeline
	.pipe(
		// body,
		boundBody1,
		// // method,
		// // boundBody2,
		// // body(({ method }) => ''),
		boundMethod,
		def,
		// // boundBody2,
		// // body({ hiThere: true }),
		// method(({ context, heyy, method, body }) => "POST" as const),
		// withDelete,
		// method(({ context, heyy, method, body }) => "POST" as const),
		// method((data) => "POST" as const),
		// method(({ context, method, heyy }) => "GET" as const),
	)
	.getContext();
