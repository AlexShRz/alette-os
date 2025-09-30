import { ApiError, FatalApiError } from "@alette/pulse";
import * as E from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { IGlobalContext } from "../context";
import { GlobalContext } from "../context/services/GlobalContext";
import { SystemLogger } from "../logger/SystemLogger";

export type THandleableError = ApiError | FatalApiError | unknown;

export interface IErrorHandlerFn {
	(
		error: THandleableError,
		utils: { context: IGlobalContext },
	): void | Promise<void>;
}

export class ErrorHandler extends E.Service<ErrorHandler>()("ErrorHandler", {
	scoped: E.fn(function* (
		getApiRuntime: () => ManagedRuntime.ManagedRuntime<any, any>,
	) {
		const globalContext = yield* GlobalContext;
		const log = yield* SystemLogger;
		let reporter: IErrorHandlerFn = () => {};

		return {
			setHandler(passedHandler: IErrorHandlerFn) {
				reporter = passedHandler;
				return this;
			},

			handle<T extends THandleableError>(error: T) {
				return E.gen(function* () {
					const context = yield* globalContext.get();
					const runHandler = async () =>
						await reporter(error, { context: context });

					yield* E.promise(() => runHandler());

					/**
					 * If our error is fatal, shutdown the api
					 * */
					if (error instanceof FatalApiError) {
						log.fatal(error.toString());
						yield* getApiRuntime().disposeEffect.pipe(E.forkDaemon);
					}
				});
			},
		};
	}),
}) {}
