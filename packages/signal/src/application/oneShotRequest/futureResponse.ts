interface IPendingRequestAbortSubscriber {
	(): void;
}

export interface IFutureResponse<Result> extends Promise<Result> {
	abort: () => void;
}

export const futureResponse = <Result, ErrorType = Error>(
	providedExecutor: (
		resolve: (value: Result | PromiseLike<Result>) => void,
		reject: (reason: ErrorType) => void,
	) => void,
	abortSubscriber: IPendingRequestAbortSubscriber | null = null,
): IFutureResponse<Result> => {
	class FutureResponse extends Promise<Result> {
		constructor(
			/**
			 * You must accept a function in the constructor,
			 * the promise will fail with "'resolve'/'reject' is not callable".
			 * */
			executor: (
				resolve: (value: Result | PromiseLike<Result>) => void,
				reject: (reason: ErrorType) => void,
			) => void,
		) {
			super((resolve, reject) => executor(resolve, reject));
		}

		abort() {
			/**
			 * ".this" does not work with Promise extension,
			 * so we have to fall back to simple closures.
			 * */
			abortSubscriber && abortSubscriber();
		}
	}

	return new FutureResponse(providedExecutor);
};
