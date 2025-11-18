import { Callable, TIsExactlyLeft } from "@alette/shared";
import { IRequestContext } from "../context";
import { IRequestContextPatch } from "../context/RequestContextPatches";
import { IAnyMiddlewareSpecification } from "../specification";
import { RequestMiddleware } from "./RequestMiddleware";

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

	getSpecification() {
		return this.middlewareSpec;
	}

	/**
	 * All methods below are a hack, but necessary
	 * to make sure TS narrows down class generics to
	 * concrete values.
	 * ------------------------------------------
	 * */
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
