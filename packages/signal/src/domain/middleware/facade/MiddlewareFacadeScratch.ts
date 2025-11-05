import { ApiError, as } from "@alette/pulse";
import { allRequestMiddleware } from "../../categorization";
import { IRequestContext } from "../../context";
import {
	IRequestContextPatch,
	TApplyRequestContextPatches,
} from "../../context/RequestContextPatches";
import { mapError, throws } from "../../errors";
import { abortedBy, factoryMiddlewareName } from "../../execution";
import {
	body,
	gets,
	headers,
	input,
	method,
	methodMiddlewareName,
} from "../../preparation";
import { map, output } from "../../response";
import {
	IAnyRequestSpecification,
	TVerifyMiddlewareCompatibility,
	TVerifyMiddlewareSupplier,
	requestSpecification,
} from "../../specification";
import { slot } from "../slot/Slot";
import { MiddlewareFacade } from "./MiddlewareFacade";
import { TAnyMiddlewareFacade } from "./TAnyMiddlewareFacade";

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

type TSpec<T> = T extends TAnyMiddlewareFacade<any, any, infer Spec, any, any>
	? Spec
	: false;

type TInContext<T> = T extends TAnyMiddlewareFacade<any, infer C, any, any, any>
	? C
	: false;

type TArgs<T> = T extends TAnyMiddlewareFacade<any, any, any, infer A, any>
	? A
	: false;

type TOutContext<T> = T extends TAnyMiddlewareFacade<
	any,
	any,
	any,
	any,
	infer C
>
	? C
	: false;

type TTest<T extends TAnyMiddlewareFacade<any, any, any, any, any>> = true;

class MyError1 extends ApiError {
	cloneSelf() {
		return new MyError1();
	}
}

class MyError2 extends ApiError {
	cloneSelf() {
		return new MyError2();
	}
}

const def = method;
const withGet = method("GET");
const withDelete = method("DELETE");

const boundErrors = throws(MyError1);

const boundInput = input(as<{ hey: string }>());
const boundAbort = abortedBy(new AbortController());

// const boundPutMethod = method(() => "PUT");
// const boundBody1 = body("asdas");
// const boundBody2 = body({ helloooo: "there" });
// const bodyaweasd = body;

type ASdadasd = TTest<typeof withGet>;
// type ASdadasdasdasd = TTest<typeof boundBody2>;
type ASdadasd2 = TTest<typeof def>;
type sss = TSpec<typeof withGet>;
type sss2 = TSpec<typeof def>;
type out = TOutContext<typeof withDelete>;
type out2 = TOutContext<typeof def>;
type out3 = TOutContext<typeof boundInput>;
type out4 = TOutContext<typeof boundAbort>;
type out5 = TOutContext<typeof boundErrors>;

// type Final1 = TApplyRequestContextPatches<
// 	{ value: { test: string } },
// 	TOutContext<typeof withDelete>
// >;
// type Final2 = TApplyRequestContextPatches<
// 	{ we: string; value: { test: string; body: { hii: string } } },
// 	TOutContext<typeof boundBody2>
// >;
//
// type Final3 = TApplyRequestContextPatches<
// 	{ value: { body: string; heyy: string; method: "DELETE" } },
// 	TOutContext<typeof boundBody2>
// >;
//
// type Final4 = TApplyRequestContextPatches<
// 	// { hey: string; value: { body: string; heyy: string; method: "DELETE" } },
// 	{
// 		hey: string;
// 		value: { body: { hi: string }; heyy: string; method: "DELETE" };
// 	},
// 	[
// 		// IRequestContextPatch<
// 		// 	{ wr: string; value: { body: { hi: string }; method: "PATCH" } },
// 		// 	"replace"
// 		// >,
// 		IRequestContextPatch<{
// 			mergeMe: string;
// 			value: { body: { helloo: string }; mergeMe2: string };
// 		}>,
// 	]
// >;
//
// type Final5 = TApplyRequestContextPatches<
// 	{
// 		hey: string;
// 		value: { errors: "hi" | "there"; heyy: string; method: "DELETE" };
// 	},
// 	[
// 		IRequestContextPatch<
// 			{
// 				value: { errors: "hello"; mergeMe2: string };
// 			},
// 			"merge"
// 		>,
// 	]
// >;
type Final6 = TApplyRequestContextPatches<
	{
		types: { errors: unknown; originalErrorType: unknown };
	},
	[
		IRequestContextPatch<
			{
				types: {
					errors: MyError1 | MyError2;
					originalErrorType: MyError1 | MyError2;
				};
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
class PipeTest<
	Context extends IRequestContext,
	RequestSpec extends IAnyRequestSpecification,
> {
	getContext(): Context["value"] {
		return {} as any;
	}

	pipe<N1 extends string, NC1 extends IRequestContextPatch<any, any>[]>(
		m1: TAnyMiddlewareFacade<N1, Context, any, any, NC1, RequestSpec>,
	): PipeTest<TApplyRequestContextPatches<Context, NC1>, RequestSpec>;
	// pipe<N1 extends string, NC1 extends IRequestContextPatch<any, any>[]>(
	// 	m1: TAnyMiddlewareFacade<N1, Context, any, any, NC1>,
	// ): PipeTest<TApplyRequestContextPatches<Context, NC1>, RequestSpec>;
	// pipe<
	// 	N1 extends string,
	// 	NC1 extends IRequestContextPatch<any, any>[],
	// 	N2 extends string,
	// 	NC2 extends IRequestContextPatch<any, any>[],
	// >(
	// 	m1: TAnyMiddlewareFacade<N1, Context, any, any, NC1>,
	// 	m2: TAnyMiddlewareFacade<
	// 		N2,
	// 		TApplyRequestContextPatches<Context, NC1>,
	// 		any,
	// 		any,
	// 		NC2
	// 	>,
	// ): PipeTest<
	// 	TApplyRequestContextPatches<Context, [...NC1, ...NC2]>,
	// 	RequestSpec
	// >;
	pipe(...middleware: MiddlewareFacade<any, any, any, any>[]) {
		return this as any;
	}
}

const spec = requestSpecification()
	.accepts(...allRequestMiddleware, factoryMiddlewareName)
	.prohibits(methodMiddlewareName)
	.build();

const pipeline = new PipeTest<
	IRequestContext & { value: { body: string; heyy: string; method: "DELETE" } },
	typeof spec
>();

// const boundBody1 = body({ heyll: "stasd" });
//
// const boundOutput = output(as<{ test: string }>());
//
// const withCommonMiddleware = slot(
// 	// boundOutput,
// 	// boundErrors,
// 	boundBody1,
// 	throws(MyError2),
// 	// throws(MyError2),
// 	// input(as<{ hey: string }>()),
// 	// headers({ hi: "ads" }),
// 	// credentials,
// 	// boundBody1,
// 	// map((v) => {}),
// 	mapError((er) => new MyError2()),
// 	// method(({ context, credentials, method, body, headers }) => "POST" as const),
// );

const test = pipeline
	.pipe(
		// body,
		// boundBody1,
		method(({ context, heyy, method, body }) => "POST" as const),
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

const test2 = test.pipe(
	method(({ context, heyy, method, body }) => "DELETE" as const),
);
