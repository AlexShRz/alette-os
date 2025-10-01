import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { PendingRequest } from "./PendingRequest";
import { IRequestMiddleware, IRequestPipeline } from "./RequestTypes";
import { RequestRunner } from "./runner/RequestRunner";
import { ProgressBroadcaster } from "./services/ProgressBroadcaster";
import { RequestData } from "./services/RequestData";

export class RequestWorkflow implements IRequestPipeline {
	protected collectedMiddleware: IRequestMiddleware[] = [];

	with: IRequestPipeline["with"] = (...middleware: IRequestMiddleware[]) => {
		const self = this.clone();
		self.collectedMiddleware = [...self.collectedMiddleware, ...middleware];
		return self;
	};

	toFactory() {
		return this.with.bind(this);
	}

	clone() {
		return new RequestWorkflow();
	}

	execute() {
		const configuredRequest = this.collectedMiddleware.reduce(
			(request, middleware) => middleware(request),
			new PendingRequest(),
		);

		const runRequest = configuredRequest
			.unwrap()
			.pipe(
				E.provide(
					Layer.provideMerge(
						RequestRunner.Default,
						Layer.mergeAll(ProgressBroadcaster.Default, RequestData.Default),
					),
				),
			);

		return E.runPromise(runRequest);
	}
}
