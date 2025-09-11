import * as Context from "effect/Context";
import * as E from "effect/Effect";
import * as Layer from "effect/Layer";
import { TRequestMode } from "../../../../domain/execution/worker/RequestWorkerConfig";
import { TAnyMiddlewareInjector } from "../../../blueprint";
import { RequestController } from "../../../blueprint/controller/RequestController";

export class PrepareRequestWorkerArguments extends Context.Tag(
	"PrepareRequestWorkerArguments",
)<
	PrepareRequestWorkerArguments,
	{
		/**
		 * 1. The thread that's going to supervise
		 * the request worker.
		 * 2. ThreadId is changed when we change our
		 * request builder configuration - add middleware, etc.
		 * */
		threadId: string;
		/**
		 * 1. The worker that's going to execute the actual request.
		 * 2. WorkerId === requestId. We should create a worker
		 * for every new request, the only time when we might reuse
		 * a worker is when the request "state sharing" mode is on.
		 * */
		workerId: string;
		requestMode: TRequestMode;
		/**
		 * 1. Middleware/Watcher factories that will be lazily
		 * initialized to aggregate actual middleware for the actual
		 * request worker.
		 * 2. The aggregation is done via event dispatching. We
		 * send the aggregation event to the bus that contains
		 * middleware injectors (they are also event bus listeners),
		 * and injectors provide actual middleware.
		 * */
		middlewareInjectors: TAnyMiddlewareInjector[];
		controller: RequestController;
	}
>() {
	static make(args: PrepareRequestWorkerArguments["Type"]) {
		return Layer.effect(PrepareRequestWorkerArguments, E.succeed(args));
	}
}
