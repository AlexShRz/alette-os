import { Callable } from "@alette/shared";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { PendingRequest } from "./PendingRequest";
import { IRequestMiddleware, IRequestPipeline } from "./RequestTypes";
import { RequestExecutor } from "./executor/RequestExecutor";
import { ProgressBroadcaster } from "./services/ProgressBroadcaster";
import { RequestData } from "./services/RequestData";

export class RequestWorkflow
	extends Callable<() => Promise<unknown>>
	implements IRequestPipeline
{
	protected collectedMiddleware: IRequestMiddleware[] = [];

	constructor() {
		super(() => {
			const configuredRequest = this.collectedMiddleware.reduce(
				(request, middleware) => middleware(request),
				new PendingRequest(),
			);

			const runRequest = configuredRequest
				.unwrap()
				.pipe(
					E.provide(
						Layer.provideMerge(
							RequestExecutor.Default,
							Layer.mergeAll(ProgressBroadcaster.Default, RequestData.Default),
						),
					),
				);

			return E.runPromise(runRequest).then((result) => {
				if (result._tag === "Left") {
					throw result.left;
				}

				return result.right;
			});
		});
	}

	with: IRequestPipeline["with"] = (...middleware: IRequestMiddleware[]) => {
		const self = this.clone();
		self.collectedMiddleware = [...self.collectedMiddleware, ...middleware];
		return self;
	};

	toFactory() {
		return this.with.bind(this);
	}

	clone() {
		const self = new RequestWorkflow();
		self.collectedMiddleware = [...this.collectedMiddleware];
		return self;
	}
}
